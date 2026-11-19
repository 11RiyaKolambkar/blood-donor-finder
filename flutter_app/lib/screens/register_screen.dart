import 'package:flutter/material.dart';
import 'package:geolocator/geolocator.dart';
import 'package:provider/provider.dart';
import '../providers/auth_provider.dart';
import '../services/auth_service.dart';
import '../services/notification_service.dart';

const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

class RegisterScreen extends StatefulWidget {
  const RegisterScreen({super.key});
  @override
  State<RegisterScreen> createState() => _RegisterScreenState();
}

class _RegisterScreenState extends State<RegisterScreen> {
  final _formKey = GlobalKey<FormState>();
  final _name = TextEditingController();
  final _email = TextEditingController();
  final _password = TextEditingController();
  final _phone = TextEditingController();
  String _bloodGroup = 'A+';
  String _role = 'recipient';

  Future<void> _register() async {
    if (!_formKey.currentState!.validate()) return;
    try {
      final fcmToken = await NotificationService.getToken();
      await context.read<AuthProvider>().register({
        'name': _name.text.trim(),
        'email': _email.text.trim(),
        'password': _password.text,
        'phone': _phone.text.trim(),
        'bloodGroup': _bloodGroup,
        'role': _role,
      });
      // Update location + FCM token
      final pos = await Geolocator.getCurrentPosition();
      await AuthService()
          .updateLocation(pos.latitude, pos.longitude, fcmToken ?? '');
      if (mounted) Navigator.pushReplacementNamed(context, '/home');
    } catch (e) {
      if (mounted)
        ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(content: Text(e.toString()), backgroundColor: Colors.red));
    }
  }

  @override
  Widget build(BuildContext context) {
    final loading = context.watch<AuthProvider>().isLoading;
    return Scaffold(
      appBar: AppBar(title: const Text('Create Account')),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(24),
        child: Form(
          key: _formKey,
          child: Column(children: [
            for (final f in [
              (_name, 'Full Name', Icons.person, false),
              (_email, 'Email', Icons.email, false),
              (_phone, 'Phone', Icons.phone, false),
              (_password, 'Password', Icons.lock, true),
            ]) ...[
              TextFormField(
                controller: f.$1,
                decoration: InputDecoration(
                    labelText: f.$2,
                    prefixIcon: Icon(f.$3),
                    border: const OutlineInputBorder()),
                obscureText: f.$4,
                keyboardType: f.$2 == 'Email'
                    ? TextInputType.emailAddress
                    : TextInputType.text,
                validator: (v) => v!.isNotEmpty ? null : 'Required',
              ),
              const SizedBox(height: 16),
            ],
            DropdownButtonFormField<String>(
              value: _bloodGroup,
              decoration: const InputDecoration(
                  labelText: 'Blood Group', border: OutlineInputBorder()),
              items: bloodGroups
                  .map((g) => DropdownMenuItem(value: g, child: Text(g)))
                  .toList(),
              onChanged: (v) => setState(() => _bloodGroup = v!),
            ),
            const SizedBox(height: 16),
            DropdownButtonFormField<String>(
              value: _role,
              decoration: const InputDecoration(
                  labelText: 'Role', border: OutlineInputBorder()),
              items: const [
                DropdownMenuItem(
                    value: 'recipient', child: Text('Recipient (need blood)')),
                DropdownMenuItem(
                    value: 'donor', child: Text('Donor (can donate)')),
              ],
              onChanged: (v) => setState(() => _role = v!),
            ),
            const SizedBox(height: 24),
            SizedBox(
              width: double.infinity,
              child: ElevatedButton(
                onPressed: loading ? null : _register,
                child: loading
                    ? const CircularProgressIndicator(color: Colors.white)
                    : const Text('Register', style: TextStyle(fontSize: 16)),
              ),
            ),
            TextButton(
              onPressed: () => Navigator.pop(context),
              child: const Text('Already have an account? Login'),
            ),
          ]),
        ),
      ),
    );
  }
}
