import 'package:flutter/material.dart';
import '../models/user_model.dart';
import 'blood_group_chip.dart';

class DonorCard extends StatelessWidget {
  final UserModel donor;
  final VoidCallback? onTap;

  const DonorCard({super.key, required this.donor, this.onTap});

  @override
  Widget build(BuildContext context) {
    return Card(
      margin: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
      child: ListTile(
        onTap: onTap,
        leading: BloodGroupChip(bloodGroup: donor.bloodGroup, fontSize: 11),
        title: Text(donor.name, style: const TextStyle(fontWeight: FontWeight.bold)),
        subtitle: Text('📞 ${donor.phone}'),
        trailing: donor.isAvailable
            ? Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                decoration: BoxDecoration(color: const Color(0xFF27AE60), borderRadius: BorderRadius.circular(12)),
                child: const Text('Available', style: TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.bold)),
              )
            : Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                decoration: BoxDecoration(color: Colors.grey[400], borderRadius: BorderRadius.circular(12)),
                child: const Text('Busy', style: TextStyle(color: Colors.white, fontSize: 11)),
              ),
      ),
    );
  }
}
