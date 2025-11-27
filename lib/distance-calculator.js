/**
 * Calculate distance between two coordinates using Haversine formula
 * @param {number} lat1 - Latitude of point 1
 * @param {number} lon1 - Longitude of point 1
 * @param {number} lat2 - Latitude of point 2
 * @param {number} lon2 - Longitude of point 2
 * @returns {number} Distance in kilometers
 */
export function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Earth's radius in kilometers
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);

    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;

    return Math.round(distance * 100) / 100; // Round to 2 decimal places
}

/**
 * Convert degrees to radians
 */
function toRad(degrees) {
    return degrees * (Math.PI / 180);
}

/**
 * Calculate distance-based pricing
 * @param {number} basePrice - Base service price
 * @param {number} distance - Distance in km
 * @param {number} pricePerKm - Price per kilometer
 * @param {number} freeDistanceKm - Free distance included in base price
 * @returns {object} Pricing breakdown
 */
export function calculateDistancePricing(basePrice, distance, pricePerKm = 10, freeDistanceKm = 5) {
    const chargeableDistance = Math.max(0, distance - freeDistanceKm);
    const distanceCharge = chargeableDistance * pricePerKm;
    const totalPrice = basePrice + distanceCharge;

    return {
        basePrice,
        distance: Math.round(distance * 100) / 100,
        freeDistanceKm,
        chargeableDistance: Math.round(chargeableDistance * 100) / 100,
        pricePerKm,
        distanceCharge: Math.round(distanceCharge * 100) / 100,
        totalPrice: Math.round(totalPrice * 100) / 100
    };
}

/**
 * Check if customer is within provider's service radius
 * @param {number} providerLat - Provider latitude
 * @param {number} providerLon - Provider longitude
 * @param {number} customerLat - Customer latitude
 * @param {number} customerLon - Customer longitude
 * @param {number} serviceRadiusKm - Provider's service radius
 * @returns {boolean} True if within radius
 */
export function isWithinServiceRadius(providerLat, providerLon, customerLat, customerLon, serviceRadiusKm) {
    const distance = calculateDistance(providerLat, providerLon, customerLat, customerLon);
    return distance <= serviceRadiusKm;
}
