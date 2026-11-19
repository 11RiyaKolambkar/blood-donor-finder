import 'package:flutter/material.dart';
import 'package:geolocator/geolocator.dart';
import '../models/user_model.dart';
import '../services/donor_service.dart';
import '../widgets/donor_card.dart';

const bloodGroups = ['', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

class NearbyDonorsScreen extends StatefulWidget {
  const NearbyDonorsScreen({super.key});
  @override
  State<NearbyDonorsScreen> createState() => _NearbyDonorsScreenState();
}

class _NearbyDonorsScreenState extends State<NearbyDonorsScreen> {
  Position? _pos;
  List<UserModel> _donors = [];
  String _bloodGroup = '';
  final double _radius = 50000;
  bool _loading = false;

  @override
  void initState() {
    super.initState();
    _initAndLoad();
  }

  Future<void> _initAndLoad() async {
    try {
      await Geolocator.requestPermission();
      final pos = await Geolocator.getCurrentPosition().timeout(const Duration(seconds: 4));
      if (mounted) setState(() => _pos = pos);
    } catch (_) {
      // Handled silently for web / desktop without GPS
    }
    _search();
  }

  Future<void> _search() async {
    setState(() => _loading = true);
    try {
      final double lat = _pos?.latitude ?? 12.9716;
      final double lng = _pos?.longitude ?? 77.5946;
      final donors = await DonorService().getNearbyDonors(
        lat: lat,
        lng: lng,
        bloodGroup: _bloodGroup.isEmpty ? null : _bloodGroup,
        radius: _radius.toInt(),
      );
      if (mounted) setState(() => _donors = donors);
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Search note: $e')),
        );
      }
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('🩸 Nearby Donors'),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: _loading ? null : _search,
            tooltip: 'Refresh',
          ),
        ],
      ),
      body: Column(
        children: [
          // Filter bar
          Padding(
            padding: const EdgeInsets.all(10),
            child: Row(
              children: [
                Expanded(
                  child: DropdownButtonFormField<String>(
                    value: _bloodGroup,
                    isDense: true,
                    decoration: const InputDecoration(
                      labelText: 'Blood Group',
                      border: OutlineInputBorder(),
                      contentPadding: EdgeInsets.symmetric(horizontal: 10, vertical: 8),
                    ),
                    items: bloodGroups
                        .map((g) => DropdownMenuItem(value: g, child: Text(g.isEmpty ? 'All Groups' : g)))
                        .toList(),
                    onChanged: (v) {
                      setState(() => _bloodGroup = v ?? '');
                      _search();
                    },
                  ),
                ),
                const SizedBox(width: 8),
                ElevatedButton.icon(
                  onPressed: _loading ? null : _search,
                  icon: _loading
                      ? const SizedBox(width: 16, height: 16, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white))
                      : const Icon(Icons.search),
                  label: const Text('Search'),
                ),
              ],
            ),
          ),
          const Divider(height: 1),
          // Donor list
          Expanded(
            child: _loading && _donors.isEmpty
                ? const Center(child: CircularProgressIndicator())
                : _donors.isEmpty
                    ? Center(
                        child: Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Icon(Icons.person_off, size: 64, color: Colors.grey[400]),
                            const SizedBox(height: 12),
                            const Text(
                              'No donors matching this filter',
                              style: TextStyle(fontSize: 16, color: Colors.grey),
                            ),
                            const SizedBox(height: 12),
                            ElevatedButton(
                              onPressed: () {
                                setState(() => _bloodGroup = '');
                                _search();
                              },
                              child: const Text('Show All Donors'),
                            ),
                          ],
                        ),
                      )
                    : RefreshIndicator(
                        onRefresh: _search,
                        child: ListView.builder(
                          physics: const AlwaysScrollableScrollPhysics(),
                          itemCount: _donors.length,
                          itemBuilder: (_, i) => DonorCard(donor: _donors[i]),
                        ),
                      ),
          ),
        ],
      ),
    );
  }
}
