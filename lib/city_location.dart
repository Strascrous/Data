import 'dart:math';

class CityLocation {
    double latitude;
    double longitude;
    double? distance;

    CityLocation(this.latitude, this.longitude);

    double distanceTo(double latitude, double longitude) {
        const R = 6371.0; // Earth radius
        final dLat = _toRad(latitude - this.latitude) / 2;
        final dLon = _toRad(longitude - this.longitude) / 2;

        final a = sin(dLat) * sin(dLat) +
            cos(_toRad(latitude)) * cos(_toRad(this.latitude)) *
            sin(dLon) * sin(dLon);

        final distance = R * 2 * atan2(sqrt(a), sqrt(1 - a));
        this.distance = distance;
        return distance;
    }

    void resetDistance() {
        distance = null;
    }

    static double _toRad(double deg) => deg * pi / 180;
}
