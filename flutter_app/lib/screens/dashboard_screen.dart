import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/auth_provider.dart';
import '../providers/request_provider.dart';
import '../services/donor_service.dart';

class DashboardScreen extends StatefulWidget {
  const DashboardScreen({super.key});
  @override
  State<DashboardScreen> createState() => _DashboardScreenState();
}

class _DashboardScreenState extends State<DashboardScreen> {
  @override
  void initState() {
    super.initState();
    Future.microtask(() => context.read<RequestProvider>().fetchRequests());
  }

  Future<void> _toggleAvailability() async {
    final newVal = await DonorService().toggleAvailability();
    if (mounted) context.read<AuthProvider>().updateAvailability(newVal);
  }

  Color _urgencyColor(String u) => u == 'critical'
      ? Colors.red
      : u == 'urgent'
          ? Colors.orange
          : Colors.green;

  void _showRequestDetails(BuildContext context, dynamic req, bool isDonor) {
    showModalBottomSheet(
      context: context,
      shape: const RoundedRectangleBorder(
          borderRadius: BorderRadius.vertical(top: Radius.circular(20))),
      builder: (ctx) {
        final isAccepted = req.status == 'accepted';
        return Padding(
          padding: const EdgeInsets.all(24),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Row(
                    children: [
                      CircleAvatar(
                        backgroundColor: const Color(0xFFC0392B),
                        child: Text(req.bloodGroup,
                            style: const TextStyle(
                                color: Colors.white,
                                fontWeight: FontWeight.bold)),
                      ),
                      const SizedBox(width: 12),
                      Text('${req.bloodGroup} Blood Request',
                          style: const TextStyle(
                              fontSize: 18, fontWeight: FontWeight.bold)),
                    ],
                  ),
                  Container(
                    padding:
                        const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                    decoration: BoxDecoration(
                      color: _urgencyColor(req.urgency).withOpacity(0.15),
                      borderRadius: BorderRadius.circular(6),
                    ),
                    child: Text(
                      req.urgency.toUpperCase(),
                      style: TextStyle(
                          color: _urgencyColor(req.urgency),
                          fontWeight: FontWeight.bold,
                          fontSize: 12),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 16),
              if (req.hospitalName.isNotEmpty) ...[
                Row(children: [
                  const Icon(Icons.local_hospital,
                      size: 18, color: Colors.grey),
                  const SizedBox(width: 8),
                  Expanded(
                      child: Text(req.hospitalName,
                          style: const TextStyle(fontWeight: FontWeight.w600))),
                ]),
                const SizedBox(height: 8),
              ],
              Row(children: [
                const Icon(Icons.notes, size: 18, color: Colors.grey),
                const SizedBox(width: 8),
                Expanded(
                    child: Text(req.message.isNotEmpty
                        ? req.message
                        : 'Emergency blood transfusion required.')),
              ]),
              if (req.contactPhone.isNotEmpty) ...[
                const SizedBox(height: 8),
                Row(children: [
                  const Icon(Icons.phone, size: 18, color: Colors.green),
                  const SizedBox(width: 8),
                  Text('Contact: ${req.contactPhone}',
                      style: const TextStyle(
                          color: Colors.green, fontWeight: FontWeight.bold)),
                ]),
              ],
              const SizedBox(height: 20),
              SizedBox(
                width: double.infinity,
                child: ElevatedButton.icon(
                  style: ElevatedButton.styleFrom(
                    backgroundColor:
                        isAccepted ? Colors.grey : const Color(0xFFC0392B),
                    foregroundColor: Colors.white,
                    padding: const EdgeInsets.symmetric(vertical: 14),
                    shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(10)),
                  ),
                  icon: Icon(isAccepted ? Icons.check : Icons.favorite),
                  label: Text(isAccepted
                      ? 'Already Accepted'
                      : 'I Can Donate (Accept Request)'),
                  onPressed: isAccepted
                      ? null
                      : () async {
                          Navigator.pop(ctx);
                          final success = await context
                              .read<RequestProvider>()
                              .acceptRequest(req.id);
                          if (mounted) {
                            ScaffoldMessenger.of(context).showSnackBar(
                              SnackBar(
                                content: Text(success
                                    ? '✅ Thank you! You accepted the request.'
                                    : 'Failed to update request.'),
                                backgroundColor:
                                    success ? Colors.green : Colors.red,
                              ),
                            );
                          }
                        },
                ),
              ),
            ],
          ),
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    final auth = context.watch<AuthProvider>();
    final reqs = context.watch<RequestProvider>();
    final user = auth.user;
    final isDonor = user?.role == 'donor';

    return Scaffold(
      appBar: AppBar(
        title: const Text('🩸 Dashboard'),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: () => context.read<RequestProvider>().fetchRequests(),
            tooltip: 'Refresh Requests',
          ),
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          Card(
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Row(children: [
                CircleAvatar(
                  radius: 30,
                  backgroundColor: const Color(0xFFC0392B),
                  child: Text(
                    user?.bloodGroup ?? '?',
                    style: const TextStyle(
                        color: Colors.white,
                        fontWeight: FontWeight.bold,
                        fontSize: 18),
                  ),
                ),
                const SizedBox(width: 16),
                Expanded(
                  child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(user?.name ?? 'User',
                            style: const TextStyle(
                                fontSize: 18, fontWeight: FontWeight.bold)),
                        Text(user?.email ?? '',
                            style: TextStyle(
                                color: Colors.grey[600], fontSize: 13)),
                        const SizedBox(height: 4),
                        Chip(
                          label: Text(isDonor ? 'Verified Donor' : 'Recipient'),
                          backgroundColor:
                              isDonor ? Colors.red[100] : Colors.blue[100],
                        ),
                      ]),
                ),
                if (isDonor)
                  Column(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      const Text('Available',
                          style: TextStyle(
                              fontSize: 12, fontWeight: FontWeight.bold)),
                      Switch(
                        value: user?.isAvailable ?? true,
                        onChanged: (_) => _toggleAvailability(),
                        activeThumbColor: const Color(0xFFC0392B),
                      ),
                    ],
                  ),
              ]),
            ),
          ),
          const SizedBox(height: 20),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                isDonor ? '🚨 Emergency Requests' : 'My Blood Requests',
                style:
                    const TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
              ),
              Text(
                '${reqs.requests.length} active',
                style: const TextStyle(color: Colors.grey, fontSize: 13),
              ),
            ],
          ),
          const SizedBox(height: 8),
          if (reqs.isLoading)
            const Center(
                child: Padding(
                    padding: EdgeInsets.all(24),
                    child: CircularProgressIndicator()))
          else if (reqs.requests.isEmpty)
            Card(
              child: Padding(
                padding: const EdgeInsets.all(24),
                child: Center(
                  child: Text(
                    isDonor
                        ? 'No emergency requests matching your blood group right now.'
                        : 'No requests created yet. Tap + Request to post.',
                    textAlign: TextAlign.center,
                    style: const TextStyle(color: Colors.grey),
                  ),
                ),
              ),
            )
          else
            ...reqs.requests.map((r) => Card(
                  margin: const EdgeInsets.only(bottom: 10),
                  elevation: 2,
                  shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(12)),
                  child: InkWell(
                    borderRadius: BorderRadius.circular(12),
                    onTap: () => _showRequestDetails(context, r, isDonor),
                    child: Padding(
                      padding: const EdgeInsets.all(12),
                      child: Column(
                        children: [
                          Row(
                            children: [
                              CircleAvatar(
                                radius: 22,
                                backgroundColor: const Color(0xFFC0392B),
                                child: Text(
                                  r.bloodGroup,
                                  style: const TextStyle(
                                      color: Colors.white,
                                      fontSize: 13,
                                      fontWeight: FontWeight.bold),
                                ),
                              ),
                              const SizedBox(width: 12),
                              Expanded(
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Text('${r.bloodGroup} Needed',
                                        style: const TextStyle(
                                            fontWeight: FontWeight.bold,
                                            fontSize: 15)),
                                    const SizedBox(height: 2),
                                    Text(
                                      r.message.isNotEmpty
                                          ? r.message
                                          : 'Emergency blood transfusion required',
                                      maxLines: 1,
                                      overflow: TextOverflow.ellipsis,
                                      style: TextStyle(
                                          color: Colors.grey[700],
                                          fontSize: 13),
                                    ),
                                  ],
                                ),
                              ),
                              Column(
                                crossAxisAlignment: CrossAxisAlignment.end,
                                children: [
                                  Text(
                                    r.urgency.toUpperCase(),
                                    style: TextStyle(
                                        color: _urgencyColor(r.urgency),
                                        fontWeight: FontWeight.bold,
                                        fontSize: 11),
                                  ),
                                  const SizedBox(height: 4),
                                  Container(
                                    padding: const EdgeInsets.symmetric(
                                        horizontal: 6, vertical: 2),
                                    decoration: BoxDecoration(
                                      color: r.status == 'accepted'
                                          ? Colors.green[100]
                                          : Colors.grey[200],
                                      borderRadius: BorderRadius.circular(4),
                                    ),
                                    child: Text(
                                      r.status.toUpperCase(),
                                      style: TextStyle(
                                        fontSize: 10,
                                        fontWeight: FontWeight.w700,
                                        color: r.status == 'accepted'
                                            ? Colors.green[800]
                                            : Colors.black87,
                                      ),
                                    ),
                                  ),
                                ],
                              ),
                            ],
                          ),
                          if (!isDonor && r.status == 'accepted') ...[
                            const SizedBox(height: 10),
                            Container(
                              width: double.infinity,
                              padding: const EdgeInsets.all(10),
                              decoration: BoxDecoration(
                                color: Colors.green[50],
                                borderRadius: BorderRadius.circular(8),
                                border: Border.all(color: Colors.green[300]!),
                              ),
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Row(
                                    children: [
                                      const Icon(Icons.check_circle,
                                          color: Colors.green, size: 16),
                                      const SizedBox(width: 6),
                                      Text(
                                        '🎉 Donor Found & Accepted!',
                                        style: TextStyle(
                                            fontWeight: FontWeight.bold,
                                            color: Colors.green[900],
                                            fontSize: 13),
                                      ),
                                    ],
                                  ),
                                  const SizedBox(height: 4),
                                  Text(
                                    'Donor: ${r.donorName.isNotEmpty ? r.donorName : "Verified Donor"} (${r.donorBloodGroup.isNotEmpty ? r.donorBloodGroup : r.bloodGroup})',
                                    style: const TextStyle(
                                        fontSize: 12,
                                        fontWeight: FontWeight.w600),
                                  ),
                                  if (r.donorPhone.isNotEmpty) ...[
                                    const SizedBox(height: 2),
                                    Text(
                                      '📞 Contact: ${r.donorPhone}',
                                      style: const TextStyle(
                                          fontSize: 12,
                                          color: Colors.green,
                                          fontWeight: FontWeight.bold),
                                    ),
                                  ],
                                ],
                              ),
                            ),
                          ],
                          const Divider(height: 16),
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              Text(
                                r.status == 'accepted'
                                    ? 'Accepted by donor'
                                    : 'Tap to view details',
                                style: TextStyle(
                                    fontSize: 12, color: Colors.grey[600]),
                              ),
                              if (r.status != 'accepted')
                                ElevatedButton(
                                  style: ElevatedButton.styleFrom(
                                    backgroundColor: const Color(0xFFC0392B),
                                    foregroundColor: Colors.white,
                                    padding: const EdgeInsets.symmetric(
                                        horizontal: 14, vertical: 6),
                                    minimumSize: Size.zero,
                                    tapTargetSize:
                                        MaterialTapTargetSize.shrinkWrap,
                                  ),
                                  onPressed: () async {
                                    final success = await context
                                        .read<RequestProvider>()
                                        .acceptRequest(r.id);
                                    if (mounted) {
                                      ScaffoldMessenger.of(context)
                                          .showSnackBar(
                                        SnackBar(
                                          content: Text(success
                                              ? '✅ You accepted this request!'
                                              : 'Failed to update request.'),
                                          backgroundColor: success
                                              ? Colors.green
                                              : Colors.red,
                                        ),
                                      );
                                    }
                                  },
                                  child: const Text('I Can Donate',
                                      style: TextStyle(
                                          fontSize: 12,
                                          fontWeight: FontWeight.bold)),
                                )
                              else
                                const Text('Accepted ✔',
                                    style: TextStyle(
                                        color: Colors.green,
                                        fontWeight: FontWeight.bold,
                                        fontSize: 12)),
                            ],
                          ),
                        ],
                      ),
                    ),
                  ),
                )),
        ]),
      ),
    );
  }
}
