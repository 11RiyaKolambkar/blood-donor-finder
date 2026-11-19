class UserModel {
  final String id;
  final String name;
  final String email;
  final String bloodGroup;
  final String phone;
  final String role;
  final bool isAvailable;
  final Map<String, dynamic>? location; // GeoJSON {type, coordinates:[lng,lat]}

  UserModel({
    required this.id,
    required this.name,
    required this.email,
    required this.bloodGroup,
    required this.phone,
    required this.role,
    required this.isAvailable,
    this.location,
  });

  factory UserModel.fromJson(Map<String, dynamic> json) => UserModel(
        id: json['_id'] ?? json['id'] ?? '',
        name: json['name'] ?? '',
        email: json['email'] ?? '',
        bloodGroup: json['bloodGroup'] ?? '',
        phone: json['phone'] ?? '',
        role: json['role'] ?? 'recipient',
        isAvailable: json['isAvailable'] ?? true,
        location: json['location'] != null
            ? Map<String, dynamic>.from(json['location'])
            : null,
      );

  double? get lat {
    final coords = location?['coordinates'];
    if (coords is List && coords.length >= 2)
      return (coords[1] as num).toDouble();
    return null;
  }

  double? get lng {
    final coords = location?['coordinates'];
    if (coords is List && coords.isNotEmpty)
      return (coords[0] as num).toDouble();
    return null;
  }

  Map<String, dynamic> toJson() => {
        '_id': id,
        'name': name,
        'email': email,
        'bloodGroup': bloodGroup,
        'phone': phone,
        'role': role,
        'isAvailable': isAvailable,
      };
}
