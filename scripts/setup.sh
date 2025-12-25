#!/usr/bin/env bash
set -euo pipefail
IFS=$'\n\t'

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

CONFIG_FILE="${CONFIG_FILE:-/etc/lbank-vip/setup.conf}"
if [ -f "$CONFIG_FILE" ]; then
  # shellcheck disable=SC1090
  source "$CONFIG_FILE"
fi

APP_NAME="${APP_NAME:-lbank-vip}"
SERVICE_NAME="${SERVICE_NAME:-lbank-vip}"
SERVICE_USER="${SERVICE_USER:-lbank}"
SERVICE_GROUP="${SERVICE_GROUP:-$SERVICE_USER}"
INSTALL_DIR="${INSTALL_DIR:-$REPO_ROOT}"
ENV_DIR="${ENV_DIR:-/etc/lbank-vip}"
SYSTEMD_DIR="${SYSTEMD_DIR:-/etc/systemd/system}"
UNIT_TEMPLATE="${UNIT_TEMPLATE:-$REPO_ROOT/systemd/lbank-vip@.service}"
NODE_BIN="${NODE_BIN:-}"
REPO_URL="${REPO_URL:-}"

if [ -z "$REPO_URL" ]; then
  REPO_URL="$(git -C "$REPO_ROOT" config --get remote.origin.url 2>/dev/null || true)"
fi

if [ -z "$NODE_BIN" ]; then
  NODE_BIN="$(command -v node || true)"
fi
if [ -z "$NODE_BIN" ]; then
  NODE_BIN="/usr/bin/node"
fi

SUDO=""
if [ "$(id -u)" -ne 0 ]; then
  if command -v sudo >/dev/null 2>&1; then
    SUDO="sudo"
  else
    SUDO=""
  fi
fi

die() {
  echo "Error: $*" >&2
  exit 1
}

log() {
  echo "[$APP_NAME] $*"
}

warn() {
  echo "[$APP_NAME] Warning: $*" >&2
}

need_root() {
  if [ -z "$SUDO" ] && [ "$(id -u)" -ne 0 ]; then
    die "This command requires root. Re-run with sudo."
  fi
}

ensure_cmd() {
  command -v "$1" >/dev/null 2>&1 || die "Missing command: $1"
}

usage() {
  cat <<EOF
Usage: $0 <command> [args...]

Commands:
  check                      Check prerequisites
  install [instances...]     Install systemd unit and base directories
  env <instance...>          Create env files (prompts for values)
  list                       List instances (from env files)
  deploy [instances...]      Build and restart instances
  upgrade [instances...]     git pull + build + restart
  fix-perms                 Fix shared permissions for git pull + runtime writes
  start [instances...]       Start services
  stop [instances...]        Stop services
  restart [instances...]     Restart services
  status [instances...]      Show service status
  enable [instances...]      Enable services at boot
  disable [instances...]     Disable services at boot
  logs <instance>            Follow logs for an instance

Environment overrides:
  CONFIG_FILE, SERVICE_USER, SERVICE_GROUP, INSTALL_DIR, ENV_DIR,
  SYSTEMD_DIR, UNIT_TEMPLATE, NODE_BIN, SERVICE_NAME, REPO_URL
EOF
}

resolve_instances() {
  if [ "$#" -gt 0 ]; then
    echo "$@"
    return
  fi

  if [ -d "$ENV_DIR" ]; then
    local files
    files="$(ls -1 "$ENV_DIR"/*.env 2>/dev/null || true)"
    if [ -n "$files" ]; then
      echo "$files" | while read -r f; do
        basename "${f%.env}"
      done
      return
    fi
  fi

  die "No instances specified and no env files found in $ENV_DIR"
}

ensure_env_file() {
  local instance="$1"
  local env_file="$ENV_DIR/$instance.env"
  if [ ! -f "$env_file" ]; then
    die "Missing env file: $env_file (run: $0 env $instance)"
  fi
}

check_prereqs() {
  ensure_cmd git
  ensure_cmd npm
  ensure_cmd node
  ensure_cmd systemctl
  ensure_cmd sed
  log "OK: prerequisites found"
}

ensure_user() {
  if id "$SERVICE_USER" >/dev/null 2>&1; then
    return
  fi
  need_root
  $SUDO useradd -r -s /usr/sbin/nologin -d "$INSTALL_DIR" "$SERVICE_USER"
}

ensure_dirs() {
  if [ ! -d "$ENV_DIR" ]; then
    need_root
    $SUDO mkdir -p "$ENV_DIR"
    $SUDO chmod 755 "$ENV_DIR"
  fi
}

install_unit() {
  need_root
  [ -f "$UNIT_TEMPLATE" ] || die "Unit template not found: $UNIT_TEMPLATE"

  local tmp
  tmp="$(mktemp)"
  sed \
    -e "s|/opt/lbank-vip|$INSTALL_DIR|g" \
    -e "s|/usr/bin/node|$NODE_BIN|g" \
    -e "s|/etc/lbank-vip|$ENV_DIR|g" \
    -e "s|User=lbank|User=$SERVICE_USER|g" \
    -e "s|Group=lbank|Group=$SERVICE_GROUP|g" \
    "$UNIT_TEMPLATE" > "$tmp"

  $SUDO install -m 0644 "$tmp" "$SYSTEMD_DIR/$SERVICE_NAME@.service"
  rm -f "$tmp"
  $SUDO systemctl daemon-reload
}

prompt_required() {
  local name="$1"
  local prompt="$2"
  local value="${!name-}"
  while [ -z "$value" ]; do
    read -r -p "$prompt" value
  done
  printf '%s' "$value"
}

prompt_secret() {
  local name="$1"
  local prompt="$2"
  local value="${!name-}"
  while [ -z "$value" ]; do
    read -r -s -p "$prompt" value
    echo ""
  done
  printf '%s' "$value"
}

prompt_optional() {
  local name="$1"
  local prompt="$2"
  local default="$3"
  local value="${!name-}"
  if [ -z "$value" ]; then
    read -r -p "$prompt [$default]: " value
  fi
  if [ -z "$value" ]; then
    value="$default"
  fi
  printf '%s' "$value"
}

prompt_lang() {
  local name="$1"
  local value="${!name-}"
  while true; do
    if [ -z "$value" ]; then
      read -r -p "BOT_LANG (en/fa) [en]: " value
      value="${value:-en}"
    fi
    if [ "$value" = "en" ] || [ "$value" = "fa" ]; then
      break
    fi
    echo "Please enter en or fa."
    value=""
  done
  printf '%s' "$value"
}

cmd_env() {
  local force=0
  if [ "${1:-}" = "--force" ]; then
    force=1
    shift
  fi
  [ "$#" -gt 0 ] || die "env requires at least one instance name"

  ensure_dirs
  for instance in "$@"; do
    local env_file="$ENV_DIR/$instance.env"
    if [ -f "$env_file" ] && [ "$force" -ne 1 ]; then
      log "Env file exists: $env_file (use --force to overwrite)"
      continue
    fi

    log "Creating env for instance: $instance"
    local bot_token group_id api_key api_secret threshold interval admin_ids lang

    bot_token="$(prompt_secret BOT_TOKEN "BOT_TOKEN: ")"
    group_id="$(prompt_required GROUP_ID "GROUP_ID: ")"
    api_key="$(prompt_required API_KEY "API_KEY: ")"
    api_secret="$(prompt_secret API_SECRET "API_SECRET: ")"
    threshold="$(prompt_required DEFAULT_THRESHOLD "DEFAULT_THRESHOLD: ")"
    interval="$(prompt_required SYNC_INTERVAL_MINUTES "SYNC_INTERVAL_MINUTES: ")"
    admin_ids="$(prompt_optional ADMIN_IDS "ADMIN_IDS (e.g., [1,2,3])" "[]")"
    lang="$(prompt_lang BOT_LANG)"

    local tmp
    tmp="$(mktemp)"
    cat > "$tmp" <<EOF
NAME=$instance
BOT_TOKEN=$bot_token
GROUP_ID=$group_id
API_KEY=$api_key
API_SECRET=$api_secret
DEFAULT_THRESHOLD=$threshold
SYNC_INTERVAL_MINUTES=$interval
ADMIN_IDS=$admin_ids
BOT_LANG=$lang
EOF

    need_root
    $SUDO install -m 600 "$tmp" "$env_file"
    rm -f "$tmp"
    log "Wrote $env_file"
  done
}

cmd_list() {
  if [ ! -d "$ENV_DIR" ]; then
    echo "No env directory: $ENV_DIR"
    return
  fi
  ls -1 "$ENV_DIR"/*.env 2>/dev/null | while read -r f; do
    basename "${f%.env}"
  done
}

cmd_fix_perms() {
  local deploy_user
  deploy_user="${DEPLOY_USER:-$(id -un)}"

  need_root
  ensure_user

  if ! getent group "$SERVICE_GROUP" >/dev/null 2>&1; then
    $SUDO groupadd "$SERVICE_GROUP"
  fi

  $SUDO usermod -a -G "$SERVICE_GROUP" "$SERVICE_USER"
  if [ "$deploy_user" != "$SERVICE_USER" ]; then
    $SUDO usermod -a -G "$SERVICE_GROUP" "$deploy_user"
  fi

  if [ -d "$INSTALL_DIR" ]; then
    $SUDO chgrp -R "$SERVICE_GROUP" "$INSTALL_DIR"
    $SUDO chmod -R g+rwX "$INSTALL_DIR"
    $SUDO find "$INSTALL_DIR" -type d -exec chmod g+s {} \;
  fi

  if [ -d "$ENV_DIR" ]; then
    $SUDO chgrp -R "$SERVICE_GROUP" "$ENV_DIR"
    $SUDO chmod -R g+rX "$ENV_DIR"
  fi

  if command -v setfacl >/dev/null 2>&1; then
    if [ -d "$INSTALL_DIR" ]; then
      $SUDO setfacl -R -m "g:${SERVICE_GROUP}:rwx" "$INSTALL_DIR"
      $SUDO setfacl -R -d -m "g:${SERVICE_GROUP}:rwx" "$INSTALL_DIR"
    fi
  fi

  if command -v git >/dev/null 2>&1; then
    if git -C "$INSTALL_DIR" rev-parse --is-inside-work-tree >/dev/null 2>&1; then
      git -C "$INSTALL_DIR" config core.sharedRepository group
    else
      warn "Skipping git sharedRepository config; $INSTALL_DIR is not a git work tree."
    fi
  else
    warn "git not found; skipping git sharedRepository config."
  fi

  log "Permissions updated for $INSTALL_DIR and $ENV_DIR."
  log "If you just added a user to the group, log out and back in."
}

do_build() {
  ensure_cmd npm
  (
    cd "$INSTALL_DIR"
    if [ -f package-lock.json ]; then
      npm ci
    else
      npm install
    fi
    npm run build
  )
}

cmd_deploy() {
  do_build
  do_systemctl restart "$@"
}

cmd_upgrade() {
  ensure_cmd git
  [ -d "$INSTALL_DIR/.git" ] || die "INSTALL_DIR is not a git repo: $INSTALL_DIR"
  (cd "$INSTALL_DIR" && git pull --ff-only)
  cmd_deploy "$@"
}

do_systemctl() {
  local action="$1"
  shift
  ensure_cmd systemctl
  local instances
  instances="$(resolve_instances "$@")"
  for instance in $instances; do
    if [ "$action" = "start" ] || [ "$action" = "restart" ]; then
      ensure_env_file "$instance"
    fi
    need_root
    $SUDO systemctl "$action" "$SERVICE_NAME@$instance"
  done
}

cmd_logs() {
  [ "$#" -eq 1 ] || die "logs requires exactly one instance"
  need_root
  $SUDO journalctl -u "$SERVICE_NAME@$1" -f
}

cmd_install() {
  check_prereqs
  ensure_user
  ensure_dirs
  if [ ! -d "$INSTALL_DIR/.git" ]; then
    if [ -z "$REPO_URL" ]; then
      die "INSTALL_DIR is not a git repo and REPO_URL is not set"
    fi
    log "Cloning repo to $INSTALL_DIR"
    git clone "$REPO_URL" "$INSTALL_DIR"
  fi
  install_unit

  if [ "$(id -un)" = "$SERVICE_USER" ]; then
    if [ ! -w "$INSTALL_DIR" ]; then
      warn "$SERVICE_USER cannot write to $INSTALL_DIR (SQLite DB will fail)."
      warn "Fix: sudo chown -R $SERVICE_USER:$SERVICE_GROUP $INSTALL_DIR"
    fi
  elif [ -n "$SUDO" ]; then
    if ! $SUDO -u "$SERVICE_USER" test -w "$INSTALL_DIR"; then
      warn "$SERVICE_USER cannot write to $INSTALL_DIR (SQLite DB will fail)."
      warn "Fix: sudo chown -R $SERVICE_USER:$SERVICE_GROUP $INSTALL_DIR"
    fi
  fi

  if [ "$#" -gt 0 ]; then
    do_systemctl enable "$@"
    do_systemctl start "$@"
  fi
}

command="${1:-}"
shift || true

case "$command" in
  check) check_prereqs ;;
  install) cmd_install "$@" ;;
  env) cmd_env "$@" ;;
  list) cmd_list ;;
  deploy) cmd_deploy "$@" ;;
  upgrade) cmd_upgrade "$@" ;;
  fix-perms) cmd_fix_perms ;;
  start|stop|restart|status|enable|disable) do_systemctl "$command" "$@" ;;
  logs) cmd_logs "$@" ;;
  ""|-h|--help) usage ;;
  *) die "Unknown command: $command" ;;
esac
