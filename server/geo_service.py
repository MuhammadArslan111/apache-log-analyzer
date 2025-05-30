from flask import Flask, request, jsonify
from flask_cors import CORS
import geoip2.database
import os
from datetime import datetime
import ipaddress
import logging
import sys

# Configure logging with a higher level to reduce output
logging.basicConfig(
    level=logging.WARNING,  # Changed from INFO to WARNING
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Disable Flask's default logging
werkzeug_logger = logging.getLogger('werkzeug')
werkzeug_logger.setLevel(logging.ERROR)  # Only show errors

app = Flask(__name__)
CORS(app)

# Disable Flask's internal logging
app.logger.disabled = True

# Get the absolute path to the database file
current_dir = os.path.dirname(os.path.abspath(__file__))
db_path = os.path.join(os.path.dirname(current_dir), 'src', 'GeoLite2-Country.mmdb')

def get_country_details(reader, ip):
    try:
        response = reader.country(ip)
        if not response or not response.country:
            return None

        country_code = response.country.iso_code
        if not country_code:
            return None

        country_code = country_code.upper()
        # Removed logging here

        return {
            'code': country_code,
            'name': response.country.name,
            'continent': {
                'name': response.continent.name if response.continent else 'Unknown',
                'code': response.continent.code if response.continent else 'XX'
            },
            'count': 0
        }
    except Exception as e:
        logger.error(f"Error processing IP {ip}: {str(e)}")
        return None

@app.route('/api/geo/batch', methods=['POST'])
def get_locations():
    ips = request.json.get('ips', [])
    locations = {}
    
    try:
        reader = geoip2.database.Reader(db_path)
        
        for ip in ips:
            try:
                if not ipaddress.ip_address(ip):
                    continue
                    
                country_info = get_country_details(reader, ip)
                if not country_info:
                    continue
                
                code = country_info['code']
                if code not in locations:
                    locations[code] = country_info
                
                locations[code]['count'] += 1
                
            except Exception as e:
                logger.error(f"Error processing IP {ip}: {str(e)}")
                continue
                
    finally:
        reader.close()
    
    result = list(locations.values())
    result.sort(key=lambda x: x['count'], reverse=True)
    
    return jsonify(result)


if __name__ == '__main__':
    try:
        # Only log startup
        logger.warning("GeoIP service starting...")
        app.run(port=5000)
    except Exception as e:
        logger.error(f"Failed to start service: {str(e)}")
        sys.exit(1) 