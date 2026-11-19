import 'package:flutter/material.dart';
import '../models/blood_request_model.dart';
import '../services/request_service.dart';

class RequestProvider extends ChangeNotifier {
  List<BloodRequest> _requests = [];
  bool _isLoading = false;
  final RequestService _service = RequestService();

  List<BloodRequest> get requests => _requests;
  bool get isLoading => _isLoading;

  Future<void> fetchRequests() async {
    _isLoading = true;
    notifyListeners();
    try {
      _requests = await _service.getMyRequests();
    } catch (_) {}
    _isLoading = false;
    notifyListeners();
  }

  Future<void> createRequest({
    required String bloodGroup,
    required String urgency,
    required String message,
    required double lat,
    required double lng,
  }) async {
    _isLoading = true;
    notifyListeners();
    try {
      final req = await _service.createRequest(
        bloodGroup: bloodGroup,
        urgency: urgency,
        message: message,
        lat: lat,
        lng: lng,
      );
      _requests.insert(0, req);
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<bool> acceptRequest(String requestId) async {
    final success = await _service.acceptRequest(requestId);
    if (success) {
      await fetchRequests();
    }
    return success;
  }
}
