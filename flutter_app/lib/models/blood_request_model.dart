class BloodRequest {
  final String id;
  final String bloodGroup;
  final String urgency;
  final String message;
  final String status;
  final String hospitalName;
  final String contactPhone;
  final String donorName;
  final String donorPhone;
  final String donorBloodGroup;
  final String createdAt;

  BloodRequest({
    required this.id,
    required this.bloodGroup,
    required this.urgency,
    required this.message,
    required this.status,
    this.hospitalName = '',
    this.contactPhone = '',
    this.donorName = '',
    this.donorPhone = '',
    this.donorBloodGroup = '',
    required this.createdAt,
  });

  factory BloodRequest.fromJson(Map<String, dynamic> json) {
    final matched = json['matchedDonor'] is Map ? json['matchedDonor'] : null;
    return BloodRequest(
      id: (json['_id'] ?? json['id'] ?? '').toString(),
      bloodGroup: (json['bloodGroup'] ?? '').toString(),
      urgency: (json['urgency'] ?? 'normal').toString(),
      message: (json['message'] ?? '').toString(),
      status: (json['status'] ?? 'pending').toString(),
      hospitalName: (json['hospitalName'] ?? '').toString(),
      contactPhone: (json['contactPhone'] ?? '').toString(),
      donorName: (json['donorName'] ?? matched?['name'] ?? '').toString(),
      donorPhone: (json['donorPhone'] ?? matched?['phone'] ?? '').toString(),
      donorBloodGroup: (json['donorBloodGroup'] ?? matched?['bloodGroup'] ?? '').toString(),
      createdAt: (json['createdAt'] ?? '').toString(),
    );
  }
}
