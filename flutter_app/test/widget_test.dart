import 'package:blood_donor_finder/widgets/blood_group_chip.dart';
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

void main() {
  testWidgets('displays the donor blood group', (WidgetTester tester) async {
    await tester.pumpWidget(
      const MaterialApp(
        home: Scaffold(
          body: BloodGroupChip(bloodGroup: 'O-'),
        ),
      ),
    );

    expect(find.text('O-'), findsOneWidget);
  });
}
