import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/auth_provider.dart';
import '../services/donor_service.dart';

class ProfileScreen extends StatelessWidget {
  const ProfileScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final auth = context.watch<AuthProvider>();
    final user = auth.user;

    return Scaffold(
      appBar: AppBar(title: const Text('My Profile')),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        child: Column(children: [
          // Avatar
          CircleAvatar(
            radius: 50,
            backgroundColor: const Color(0xFFC0392B),
            child: Text(user?.bloodGroup ?? '?',
                style: const TextStyle(
                    color: Colors.white,
                    fontSize: 28,
                    fontWeight: FontWeight.bold)),
          ),
          const SizedBox(height: 16),
          Text(user?.name ?? '',
              style:
                  const TextStyle(fontSize: 22, fontWeight: FontWeight.bold)),
          Text(user?.email ?? '', style: const TextStyle(color: Colors.grey)),
          const SizedBox(height: 8),
          Row(mainAxisAlignment: MainAxisAlignment.center, children: [
            Chip(
                label: Text(user?.role.toUpperCase() ?? ''),
                backgroundColor: const Color(0xFFFDE8E8)),
            const SizedBox(width: 8),
            Chip(
                label: Text(user?.bloodGroup ?? ''),
                backgroundColor: const Color(0xFFC0392B),
                labelStyle: const TextStyle(
                    color: Colors.white, fontWeight: FontWeight.bold)),
          ]),
          const SizedBox(height: 24),

          // Info Card
          Card(
            child: Column(children: [
              _infoTile(Icons.phone, 'Phone', user?.phone ?? '—'),
              const Divider(height: 1),
              _infoTile(
                  Icons.bloodtype, 'Blood Group', user?.bloodGroup ?? '—'),
              const Divider(height: 1),
              _infoTile(Icons.person_outline, 'Role', user?.role ?? '—'),
              if (user?.role == 'donor') ...[
                const Divider(height: 1),
                ListTile(
                  leading:
                      const Icon(Icons.toggle_on, color: Color(0xFFC0392B)),
                  title: const Text('Availability'),
                  subtitle: Text(user?.isAvailable == true
                      ? 'Available to donate ✅'
                      : 'Currently unavailable ❌'),
                  trailing: Switch(
                    value: user?.isAvailable ?? false,
                    activeColor: const Color(0xFFC0392B),
                    onChanged: (_) async {
                      final newVal = await DonorService().toggleAvailability();
                      context.read<AuthProvider>().updateAvailability(newVal);
                    },
                  ),
                ),
              ],
            ]),
          ),
          const SizedBox(height: 24),

          // Logout
          SizedBox(
            width: double.infinity,
            child: OutlinedButton.icon(
              onPressed: () async {
                await context.read<AuthProvider>().logout();
                if (context.mounted)
                  Navigator.pushReplacementNamed(context, '/login');
              },
              icon: const Icon(Icons.logout, color: Color(0xFFC0392B)),
              label: const Text('Logout',
                  style: TextStyle(color: Color(0xFFC0392B), fontSize: 16)),
              style: OutlinedButton.styleFrom(
                side: const BorderSide(color: Color(0xFFC0392B)),
                shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(8)),
                padding: const EdgeInsets.symmetric(vertical: 14),
              ),
            ),
          ),
        ]),
      ),
    );
  }

  Widget _infoTile(IconData icon, String label, String value) {
    return ListTile(
      leading: Icon(icon, color: const Color(0xFFC0392B)),
      title:
          Text(label, style: const TextStyle(fontSize: 12, color: Colors.grey)),
      subtitle: Text(value,
          style: const TextStyle(fontSize: 15, fontWeight: FontWeight.w500)),
    );
  }
}
