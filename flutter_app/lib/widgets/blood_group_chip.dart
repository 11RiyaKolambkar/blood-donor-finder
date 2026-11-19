import 'package:flutter/material.dart';

class BloodGroupChip extends StatelessWidget {
  final String bloodGroup;
  final double fontSize;

  const BloodGroupChip(
      {super.key, required this.bloodGroup, this.fontSize = 12});

  Color get _color {
    switch (bloodGroup) {
      case 'A+':
        return const Color(0xFFC0392B);
      case 'A-':
        return const Color(0xFF922B21);
      case 'B+':
        return const Color(0xFF1A5276);
      case 'B-':
        return const Color(0xFF1F618D);
      case 'AB+':
        return const Color(0xFF7D3C98);
      case 'AB-':
        return const Color(0xFF6C3483);
      case 'O+':
        return const Color(0xFF1E8449);
      case 'O-':
        return const Color(0xFF196F3D);
      default:
        return Colors.grey;
    }
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
      decoration:
          BoxDecoration(color: _color, borderRadius: BorderRadius.circular(20)),
      child: Text(bloodGroup,
          style: TextStyle(
              color: Colors.white,
              fontWeight: FontWeight.bold,
              fontSize: fontSize)),
    );
  }
}
