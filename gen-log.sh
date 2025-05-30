#!/bin/bash

# Generate and store 50 random IPs at the start
declare -a FIXED_IPS=()
for ((i=0; i<50; i++)); do
    FIXED_IPS+=("$((RANDOM % 255)).$((RANDOM % 255)).$((RANDOM % 255)).$((RANDOM % 255))")
done

# Modified generate_ip function to use only from the fixed IPs
generate_ip() {
    echo "${FIXED_IPS[$RANDOM % 50]}"
}

# Function to validate datetime format
validate_datetime() {
    date -d "$1" >/dev/null 2>&1
    return $?
}

# Ask for date and time range with validation
while true; do
    echo "Enter start date and time (format: YYYY-MM-DD HH:MM:SS):"
    read START_DATETIME
    echo "Enter end date and time (format: YYYY-MM-DD HH:MM:SS):"
    read END_DATETIME

    if validate_datetime "$START_DATETIME" && validate_datetime "$END_DATETIME"; then
        if [[ "$START_DATETIME" < "$END_DATETIME" ]]; then
            break
        else
            echo "Error: End datetime must be after start datetime"
        fi
    else
        echo "Error: Invalid datetime format. Please use YYYY-MM-DD HH:MM:SS"
    fi
done

# Modified timestamp generation function
generate_timestamp() {
    START_SECONDS=$(date -d "$START_DATETIME" +%s)
    END_SECONDS=$(date -d "$END_DATETIME" +%s)
    
    RANDOM_SECONDS=$((START_SECONDS + RANDOM % (END_SECONDS - START_SECONDS + 1)))
    TIMESTAMP=$(date -d "@$RANDOM_SECONDS" "+[%d/%b/%Y:%H:%M:%S +0000]")
    echo "$TIMESTAMP"
}

# User agents (including bots and malicious scanners)
declare -a USER_AGENTS=(
    # Modern Browsers - Windows
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Edge/91.0.864.59 Safari/537.36"
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:89.0) Gecko/20100101 Firefox/89.0"
    "Mozilla/5.0 (Windows NT 10.0; WOW64; Trident/7.0; rv:11.0) like Gecko"

    # Modern Browsers - macOS
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.1 Safari/605.1.15"
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:89.0) Gecko/20100101 Firefox/89.0"

    # Modern Browsers - Linux
    "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
    "Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:89.0) Gecko/20100101 Firefox/89.0"
    "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36 OPR/77.0.4054.277"

    # Mobile Browsers
    "Mozilla/5.0 (iPhone; CPU iPhone OS 14_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.1 Mobile/15E148 Safari/604.1"
    "Mozilla/5.0 (iPad; CPU OS 14_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.1 Mobile/15E148 Safari/604.1"
    "Mozilla/5.0 (Linux; Android 11; SM-G991B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.120 Mobile Safari/537.36"
    "Mozilla/5.0 (Linux; Android 11; Pixel 5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.120 Mobile Safari/537.36"

    # Security Tools and Bots
    "sqlmap/1.4.7#stable (http://sqlmap.org)"
    "Nikto/2.1.6"
    "Burp Suite Professional/2021.8.4"
    "Hydra/9.1"
    "Googlebot/2.1 (+http://www.google.com/bot.html)"
    "Bingbot/2.0 (+http://www.bing.com/bingbot.htm)"
    "AhrefsBot/7.0"
    "YandexBot/3.0"
    "Masscan/1.0"
    "Acunetix Scanner"
    "Nmap Scripting Engine"
    "ZAP/2.10.0"
    "Go-http-client/1.1"

    # Additional Modern Browser Variations
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36 Edg/91.0.864.59"
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36 OPR/77.0.4054.277"
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:78.0) Gecko/20100101 Firefox/78.0"
)

# Attack patterns
declare -a ATTACK_URLS=(
    "/admin/login.php?id=1+UNION+SELECT+1,2,3--+-"
    "/wp-login.php?log=admin&pwd=password"
    "/search?q=<script>alert('XSS')</script>"
    "/api/auth?username=admin&password=12345"
    "/.git/config"
    "/.env"
    "/admin/login.php?id=1' OR '1'='1"
    "/search?q=<script>alert('XSS')</script>"
    "/index.php?file=../../../../etc/passwd"
    "/wp-login.php"
    "/api/auth?user=admin&pass=1234"
)

# Normal URLs
declare -a NORMAL_URLS=(
    "/index.html"
    "/about"
    "/contact"
    "/products"
    "/css/style.css"
)

# HTTP Methods
declare -a HTTP_METHODS=("GET" "POST" "PUT" "DELETE" "HEAD" "OPTIONS")

# HTTP Response Codes
declare -a RESPONSE_CODES=("200" "201" "204" "301" "302" "403" "404" "500" "502")

# Ask user for number of logs
echo "Enter the number of log entries to generate:"
read NUM_LOGS

echo "Generating logs for period: $START_DATETIME to $END_DATETIME..."
LOG_FILE="public/custom_logs_$(date +%Y%m%d_%H%M%S).log"

# Progress counter
progress=0
total=$NUM_LOGS

for ((i=1; i<=NUM_LOGS; i++)); do
    ip=$(generate_ip)
    timestamp=$(generate_timestamp)
    method=${HTTP_METHODS[$RANDOM % ${#HTTP_METHODS[@]}]}
    response=${RESPONSE_CODES[$RANDOM % ${#RESPONSE_CODES[@]}]}
    bytes=$((RANDOM % 5000 + 200))
    user_agent=${USER_AGENTS[$RANDOM % ${#USER_AGENTS[@]}]}
    
    if (( RANDOM % 4 == 0 )); then
        url=${ATTACK_URLS[$RANDOM % ${#ATTACK_URLS[@]}]}
    else
        url=${NORMAL_URLS[$RANDOM % ${#NORMAL_URLS[@]}]}
    fi
    
    echo "$ip - - $timestamp \"$method $url HTTP/1.1\" $response $bytes \"-\" \"$user_agent\"" >> "$LOG_FILE"
    
    # Update progress every 100 entries
    if (( i % 100 == 0 )); then
        progress=$((i * 100 / total))
        echo -ne "Progress: $progress%\r"
    fi
done

echo -e "\nLog file generated successfully: $LOG_FILE"