const axios = require('axios');
const useragent = require('useragent');

class GeoLocationUtil {
    // Fetch IP geolocation details
    static async getIPLocation(ipAddress) {
      try {
        // Use a free geolocation API (replace with your preferred service)
        const response = await axios.get(`https://ipapi.co/${ipAddress}/json/`);
        const data = response.data;
  
        return {
          country: data.country_name,
          city: data.city,
          latitude: data.latitude,
          longitude: data.longitude
        };
      } catch (error) {
        console.error('IP Geolocation Error:', error);
        return null;
      }
    }
  
    // Parse user agent string
    static parseUserAgent(userAgentString) {
      const agent = useragent.parse(userAgentString);
      return {
        browser: agent.family,
        os: agent.os.family,
        deviceType: this.detectDeviceType(userAgentString)
      };
    }
  
    // Detect device type based on user agent
    static detectDeviceType(userAgentString) {
      userAgentString = userAgentString.toLowerCase();
      if (/mobile|android|touch/i.test(userAgentString)) return 'Mobile';
      if (/tablet/i.test(userAgentString)) return 'Tablet';
      return 'Desktop';
    }
  }
  
  module.exports = GeoLocationUtil;