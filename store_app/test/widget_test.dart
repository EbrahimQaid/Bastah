// This is a basic Flutter widget test.
//
// To perform an interaction with a widget in your test, use the WidgetTester
// utility in the flutter_test package. For example, you can send tap and scroll
// gestures. You can also use WidgetTester to find child widgets in the widget
// tree, read text, and verify that the values of widget properties are correct.

import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

import 'package:store_app/main.dart';

void main() {
  testWidgets('store header renders', (WidgetTester tester) async {
    await tester.pumpWidget(const MaterialApp(home: StoreHeader(store: StoreData(name: 'بَسطة', description: '', coverImage: '', logoImage: '', primaryColor: '#7C3AED', currency: 'SAR', shippingRate: 0, whatsappNumber: ''), itemCount: 0, onCart: _noop, onProducts: _noop)));
    expect(find.text('بَسطة'), findsOneWidget);
  });
}

void _noop() {}
