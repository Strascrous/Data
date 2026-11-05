import 'city_icon.dart';
import 'city_location.dart';

class City {
    String name = '';
    String id = '';
    CityIcon? icon;
    CityLocation location;

    City(this.name, this.id, this.icon, this.location);
}
