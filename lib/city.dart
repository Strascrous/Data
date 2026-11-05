import 'package:strascrous_data/city_location.dart';

import 'city_icon.dart';

class City {
    String name = '';
    String id = '';
    CityIcon? icon;
    CityLocation location;

    City(this.name, this.id, this.icon, this.location);
}
