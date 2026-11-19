import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';
import '../config/api_config.dart';
import '../models/user_model.dart';

class AuthService {
  Future<String?> _getToken() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString('token');
  }

  Future<Map<String, dynamic>> register(Map<String, dynamic> data) async {
    final res = await http.post(
      Uri.parse('$baseUrl/auth/register'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode(data),
    );
    final body = jsonDecode(res.body);
    if (res.statusCode == 201) {
      final prefs = await SharedPreferences.getInstance();
      await prefs.setString('token', body['token']);
      return body;
    }
    throw Exception(body['message'] ?? 'Registration failed');
  }

  Future<Map<String, dynamic>> login(String email, String password) async {
    final res = await http.post(
      Uri.parse('$baseUrl/auth/login'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({'email': email, 'password': password}),
    );
    final body = jsonDecode(res.body);
    if (res.statusCode == 200) {
      final prefs = await SharedPreferences.getInstance();
      await prefs.setString('token', body['token']);
      return body;
    }
    throw Exception(body['message'] ?? 'Login failed');
  }

  Future<void> updateLocation(double lat, double lng, String fcmToken) async {
    final token = await _getToken();
    await http.put(
      Uri.parse('$baseUrl/auth/location'),
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer $token'
      },
      body: jsonEncode({'lat': lat, 'lng': lng, 'fcmToken': fcmToken}),
    );
  }

  Future<UserModel> getProfile() async {
    final token = await _getToken();
    final res = await http.get(
      Uri.parse('$baseUrl/auth/profile'),
      headers: {'Authorization': 'Bearer $token'},
    );
    if (res.statusCode == 200) return UserModel.fromJson(jsonDecode(res.body));
    throw Exception('Failed to get profile');
  }

  Future<void> logout() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove('token');
  }
}
