#!/bin/bash
set -e

echo "========================================================"
echo "  Resetting MySQL root password to 'parksolitaire'"
echo "========================================================"

echo "[1/4] Stopping MySQL server..."
sudo launchctl unload -F /Library/LaunchDaemons/com.oracle.oss.mysql.mysqld.plist 2>/dev/null || true
sudo killall mysqld 2>/dev/null || true
sleep 2

echo "[2/4] Starting MySQL in safe mode (skip permissions)..."
sudo /usr/local/mysql/bin/mysqld_safe --skip-grant-tables --user=_mysql >/dev/null 2>&1 &
sleep 4

echo "[3/4] Updating root password to 'parksolitaire'..."
/usr/local/mysql/bin/mysql -u root << 'SQLEOF'
FLUSH PRIVILEGES;
ALTER USER 'root'@'localhost' IDENTIFIED BY 'parksolitaire';
FLUSH PRIVILEGES;
SQLEOF

echo "[4/4] Restarting standard MySQL server..."
sudo killall mysqld 2>/dev/null || true
sleep 2
sudo launchctl load -F /Library/LaunchDaemons/com.oracle.oss.mysql.mysqld.plist
sleep 3

echo ""
echo " SUCCESS! MySQL root password is now: parksolitaire"
echo " You can now run: npm run db:test"
echo "========================================================"
