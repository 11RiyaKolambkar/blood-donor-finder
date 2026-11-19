import 'package:flutter/material.dart';
import 'package:geolocator/geolocator.dart';
import 'package:provider/provider.dart';
import '../providers/request_provider.dart';

const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

class CreateRequestScreen extends StatefulWidget {
  const CreateRequestScreen({super.key});
  @override
  State<CreateRequestScreen> createState() => _CreateRequestScreenState();
}

class _CreateRequestScreenState extends State<CreateRequestScreen> {
  String _bloodGroup = 'A+';
  String _urgency = 'urgent';
  final _message = TextEditingController();

  final _urgencyColors = {
    'normal': Colors.green,
    'urgent': Colors.orange,
    'critical': Colors.red,
  };

  Future<void> _submit() async {
    try {
      double lat = 12.9716;
      double lng = 77.5946;

      try {
        await Geolocator.requestPermission();
        final pos = await Geolocator.getCurrentPosition()
            .timeout(const Duration(seconds: 3));
        lat = pos.latitude;
        lng = pos.longitude;
      } catch (_) {
        // Fallback to default coordinates if GPS is unavailable
      }

      await context.read<RequestProvider>().createRequest(
            bloodGroup: _bloodGroup,
            urgency: _urgency,
            message: _message.text.trim(),
            lat: lat,
            lng: lng,
          );

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Emergency request posted successfully!'),
            backgroundColor: Color(0xFFC0392B),
          ),
        );
        _message.clear();
      }
    } catch (e) {
      if (mounted)
        ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(content: Text(e.toString()), backgroundColor: Colors.red));
    }
  }

  @override
  Widget build(BuildContext context) {
    final loading = context.watch<RequestProvider>().isLoading;
    return Scaffold(
      appBar: AppBar(title: const Text('🚨 Emergency Request')),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          const Text('Blood Group Required',
              style: TextStyle(fontWeight: FontWeight.bold, fontSize: 15)),
          const SizedBox(height: 8),
          DropdownButtonFormField<String>(
            value: _bloodGroup,
            decoration: const InputDecoration(border: OutlineInputBorder()),
            items: bloodGroups
                .map((g) => DropdownMenuItem(value: g, child: Text(g)))
                .toList(),
            onChanged: (v) => setState(() => _bloodGroup = v!),
          ),
          const SizedBox(height: 20),
          const Text('Urgency Level',
              style: TextStyle(fontWeight: FontWeight.bold, fontSize: 15)),
          const SizedBox(height: 8),
          Row(
              children: ['normal', 'urgent', 'critical'].map((u) {
            final selected = _urgency == u;
            return Expanded(
              child: Padding(
                padding: const EdgeInsets.symmetric(horizontal: 4),
                child: OutlinedButton(
                  onPressed: () => setState(() => _urgency = u),
                  style: OutlinedButton.styleFrom(
                    backgroundColor:
                        selected ? _urgencyColors[u] : Colors.white,
                    foregroundColor:
                        selected ? Colors.white : _urgencyColors[u],
                    side: BorderSide(color: _urgencyColors[u]!, width: 2),
                    shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(8)),
                  ),
                  child: Text(u.toUpperCase(),
                      style: const TextStyle(fontWeight: FontWeight.bold)),
                ),
              ),
            );
          }).toList()),
          const SizedBox(height: 20),
          const Text('Hospital / Location Details & Message',
              style: TextStyle(fontWeight: FontWeight.bold, fontSize: 15)),
          const SizedBox(height: 8),
          TextField(
            controller: _message,
            decoration: const InputDecoration(
              border: OutlineInputBorder(),
              hintText:
                  'e.g. City Hospital, 3rd Floor, ICU Ward, contact 9876543210',
            ),
            maxLines: 3,
          ),
          const SizedBox(height: 28),
          SizedBox(
            width: double.infinity,
            height: 52,
            child: ElevatedButton.icon(
              onPressed: loading ? null : _submit,
              icon: loading
                  ? const SizedBox(
                      width: 20,
                      height: 20,
                      child: CircularProgressIndicator(
                          color: Colors.white, strokeWidth: 2))
                  : const Icon(Icons.send),
              label: Text(
                  loading
                      ? 'Sending alerts...'
                      : 'Send Emergency Alert to Nearby Donors',
                  style: const TextStyle(fontSize: 15)),
            ),
          ),
          const SizedBox(height: 12),
          const Center(
            child: Text(
              'Your location is automatically captured and shared\nwith matching donors in real time.',
              textAlign: TextAlign.center,
              style: TextStyle(color: Colors.grey, fontSize: 12),
            ),
          ),
        ]),
      ),
    );
  }
}
