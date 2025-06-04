#!/bin/bash

# LAMPP MySQL path
MYSQL_PATH="/opt/lampp/bin/mysql"
MYSQL_USER="root"
MYSQL_PASSWORD=""
MYSQL_HOST="localhost"
MYSQL_PORT="3306"

# Import the database
echo "Importing database..."
$MYSQL_PATH -u$MYSQL_USER -h$MYSQL_HOST -P$MYSQL_PORT < mysql_backup.sql

echo "Database import completed!" 