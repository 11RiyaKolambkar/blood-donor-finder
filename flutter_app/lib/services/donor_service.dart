import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';
import '../config/api_config.dart';
import '../models/user_model.dart';

class DonorService {
  Future<String?> _getToken() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString('token');
  }

  Future<List<UserModel>> getNearbyDonors({
    required double lat,
    required double lng,
    String? bloodGroup,
    int radius = 50000,
  }) async {
    final token = await _getToken();
    final queryParams = {
      'lat': lat.toString(),
      'lng': lng.toString(),
      'radius': radius.toString(),
      if (bloodGroup != null && bloodGroup.isNotEmpty) 'bloodGroup': bloodGroup,
    };
    final uri = Uri.parse('$baseUrl/donors/nearby').replace(queryParameters: queryParams);
    final headers = <String, String>{};
    if (token != null && token.isNotEmpty) {
      headers['Authorization'] = 'Bearer $token';
    }

    final res = await http.get(uri, headers: headers);
    if (res.statusCode == 200) {
      final dynamic data = jsonDecode(res.body);
      final list = (data is Map && data.containsKey('donors'))
          ? data['donors']
          : (data is Map && data.containsKey('data'))
              ? data['data']
              : (data is List ? data : []);
      return (list as List).map((d) => UserModel.fromJson(Map<String, dynamic>.from(d))).toList();
    }
    throw Exception('Failed to fetch donors: ${res.statusCode}');
  }

  Future<bool> toggleAvailability() async {
    final token = await _getToken();
    final headers = <String, String>{};
    if (token != null && token.isNotEmpty) {
      headers['Authorization'] = 'Bearer $token';
    }
    final res = await http.put(
      Uri.parse('$baseUrl/donors/availability'),
      headers: headers,
    );
    if (res.statusCode == 200) {
      final body = jsonDecode(res.body);
      return body['isAvailable'] ?? false;
    }
    return false;
  }
}
