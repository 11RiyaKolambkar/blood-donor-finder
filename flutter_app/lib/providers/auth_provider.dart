import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../models/user_model.dart';
import '../services/auth_service.dart';

class AuthProvider extends ChangeNotifier {
  UserModel? _user;
  String? _token;
  bool _isLoading = false;
  final AuthService _authService = AuthService();

  UserModel? get user => _user;
  String? get token => _token;
  bool get isLoading => _isLoading;
  bool get isLoggedIn => _token != null;

  Future<void> loadUserFromPrefs() async {
    final prefs = await SharedPreferences.getInstance();
    _token = prefs.getString('token');
    if (_token != null) {
      try {
        _user = await _authService.getProfile();
      } catch (_) {
        _token = null;
        await prefs.remove('token');
      }
    }
    notifyListeners();
  }

  Future<void> login(String email, String password) async {
    _isLoading = true;
    notifyListeners();
    try {
      final data = await _authService.login(email, password);
      _token = data['token'];
      _user = UserModel.fromJson(data['user']);
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<void> register(Map<String, dynamic> data) async {
    _isLoading = true;
    notifyListeners();
    try {
      final res = await _authService.register(data);
      _token = res['token'];
      _user = UserModel.fromJson(res['user']);
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<void> logout() async {
    await _authService.logout();
    _user = null;
    _token = null;
    notifyListeners();
  }

  void updateAvailability(bool value) {
    if (_user != null) {
      _user = UserModel(
        id: _user!.id,
        name: _user!.name,
        email: _user!.email,
        bloodGroup: _user!.bloodGroup,
        phone: _user!.phone,
        role: _user!.role,
        isAvailable: value,
      );
      notifyListeners();
    }
  }
}
