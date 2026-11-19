import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';
import '../config/api_config.dart';
import '../models/blood_request_model.dart';

class RequestService {
  Future<String?> _getToken() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString('token');
  }

  Future<BloodRequest> createRequest({
    required String bloodGroup,
    required String urgency,
    required String message,
    required double lat,
    required double lng,
  }) async {
    final token = await _getToken();
    final res = await http.post(
      Uri.parse('$baseUrl/requests'),
      headers: {'Content-Type': 'application/json', 'Authorization': 'Bearer $token'},
      body: jsonEncode({'bloodGroup': bloodGroup, 'urgency': urgency, 'message': message, 'lat': lat, 'lng': lng}),
    );
    final body = jsonDecode(res.body);
    if (res.statusCode == 201) return BloodRequest.fromJson(body['request']);
    throw Exception(body['message'] ?? 'Failed to create request');
  }

  Future<List<BloodRequest>> getMyRequests() async {
    final token = await _getToken();
    final res = await http.get(
      Uri.parse('$baseUrl/requests'),
      headers: {'Authorization': 'Bearer $token'},
    );
    if (res.statusCode == 200) {
      return (jsonDecode(res.body) as List).map((r) => BloodRequest.fromJson(r)).toList();
    }
    throw Exception('Failed to fetch requests');
  }

  Future<bool> acceptRequest(String requestId) async {
    final token = await _getToken();
    final res = await http.patch(
      Uri.parse('$baseUrl/requests/$requestId/status'),
      headers: {'Content-Type': 'application/json', 'Authorization': 'Bearer $token'},
      body: jsonEncode({'status': 'accepted'}),
    );
    return res.statusCode == 200;
  }
}
