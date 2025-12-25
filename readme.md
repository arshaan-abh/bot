# Telegram Bot Documentation  
This bot manages users based on their balance and allows admins to configure thresholds, manage users, and kick users below the threshold.

# How to Setup

```bash
git clone https://github.com/mahdiyarmeh/lbank-vip.git
```
or unzip the source code

```
cd lbank-vip
```

```
./start
```

- Make sure you have **tmux** and **npm** installed.

# How to Use

1. **Start the Bot**
   `/start`

   Initializes interaction with the bot.  
   If the user is not registered, the bot will ask for their UID.

2. **Set the Threshold (Admin Only)**
    `/setthreshold <amount>`

   Admins set the balance threshold for joining the group.  
   Example: /setthreshold 100

3. **View Current Threshold (Admin Only)**
    `/threshold`

   Shows the current threshold.

4. **Add New Admin (Admin Only)**
    `/addadmin <telegram_id>`

   Adds a new admin by their Telegram ID.  
   Example: /addadmin 123456

5. **Force Kick Users Below Threshold (Admin Only)**
    `/forcekick`

   Kicks users from the group who are below the balance threshold.

6. **Bot Statistics (Admin Only)**
    `/stats`

   Displays bot statistics like total users, kicked users, etc.  
   Returns a CSV export of the user database.

7. **Help (Admin Only)**
    `/help`

   Shows list of commands.

8. **Group Join Event**  
   New members who join the group are checked against the balance threshold.  
   If their balance is below the threshold, they are kicked.

# Linux Production (systemd, multi-instance)

This setup runs multiple instances on one server without Docker. Each instance
has its own env file and SQLite database (controlled by `NAME`).

## Option A: use setup.sh (recommended)

From the repo on the server (run as a normal user; the script will use sudo when required):

```
chmod +x scripts/setup.sh
./scripts/setup.sh install
./scripts/setup.sh fix-perms
./scripts/setup.sh env alpha beta gamma
./scripts/setup.sh deploy alpha beta gamma
./scripts/setup.sh enable alpha beta gamma
./scripts/setup.sh start alpha beta gamma
```

Updates:

```
git pull
./scripts/setup.sh upgrade alpha beta gamma
```

Optional config overrides can be set in `/etc/lbank-vip/setup.conf` (e.g., `INSTALL_DIR`, `SERVICE_USER`, `ENV_DIR`).

## Option B: manual steps

1) Copy the systemd unit file:

```
sudo mkdir -p /etc/lbank-vip
sudo cp systemd/lbank-vip@.service /etc/systemd/system/
sudo systemctl daemon-reload
```

2) Create one env file per instance (example: alpha, beta, gamma):

```
sudo tee /etc/lbank-vip/alpha.env >/dev/null <<'EOF'
NAME=alpha
BOT_TOKEN=...
GROUP_ID=...
API_KEY=...
API_SECRET=...
DEFAULT_THRESHOLD=100
SYNC_INTERVAL_MINUTES=30
ADMIN_IDS=[123,456]
BOT_LANG=en
EOF
```

3) Create a service user and deploy:

```
sudo useradd -r -s /usr/sbin/nologin lbank || true
sudo mkdir -p /opt/lbank-vip
sudo chown -R lbank:lbank /opt/lbank-vip

git clone https://github.com/mahdiyarmeh/lbank-vip.git /opt/lbank-vip
cd /opt/lbank-vip
npm ci
npm run build
```

4) Enable and start instances:

```
sudo systemctl enable --now lbank-vip@alpha
sudo systemctl enable --now lbank-vip@beta
sudo systemctl enable --now lbank-vip@gamma
```

5) Logs:

```
journalctl -u lbank-vip@alpha -f
```

## Updating after `git pull`

From `/opt/lbank-vip`:

```
git pull
sudo ./scripts/deploy.sh alpha beta gamma
```
