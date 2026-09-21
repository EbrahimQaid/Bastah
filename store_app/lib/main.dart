import 'dart:convert';

import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;

const apiBase = String.fromEnvironment('API_BASE_URL', defaultValue: 'https://bastah-mauve.vercel.app/api');
const primary = Color(0xFF7C3AED);
const pageBackground = Color(0xFFF8F8F8);
const textColor = Color(0xFF111827);

void main() => runApp(const BastahApp());

class StoreData {
  const StoreData({required this.name, required this.description, required this.coverImage, required this.logoImage, required this.primaryColor, required this.currency, required this.shippingRate, required this.whatsappNumber});
  final String name, description, coverImage, logoImage, primaryColor, currency, whatsappNumber;
  final double shippingRate;
  factory StoreData.fromJson(Map<String, dynamic> json) => StoreData(
        name: json['name'] as String? ?? 'بَسطة',
        description: json['description'] as String? ?? 'كل ما تحتاجه في مكان واحد',
        coverImage: json['coverImage'] as String? ?? '',
        logoImage: json['logoImage'] as String? ?? '',
        primaryColor: json['primaryColor'] as String? ?? '#7C3AED',
        currency: json['defaultCurrency'] as String? ?? 'SAR',
        shippingRate: double.tryParse('${json['shippingRate'] ?? 0}') ?? 0,
        whatsappNumber: json['whatsappNumber'] as String? ?? '',
      );
}

class Product {
  Product({required this.id, required this.name, required this.description, required this.price, required this.images, required this.inStock, required this.featured, required this.sizes, required this.colors});
  final int id;
  final String name, description;
  final double price;
  final List<String> images;
  final bool inStock, featured;
  final List<String> sizes, colors;
  factory Product.fromJson(Map<String, dynamic> json) => Product(
        id: json['id'] as int,
        name: json['name'] as String? ?? '',
        description: json['description'] as String? ?? '',
        price: double.tryParse('${json['price'] ?? 0}') ?? 0,
        images: List<String>.from(json['images'] ?? const []),
        inStock: json['inStock'] as bool? ?? false,
        featured: json['featured'] as bool? ?? false,
        sizes: List<String>.from((json['variants'] as Map?)?['sizes'] ?? const []),
        colors: List<String>.from((json['variants'] as Map?)?['colors'] ?? const []),
      );
}

class Category {
  const Category(this.id, this.name);
  final int id;
  final String name;
  factory Category.fromJson(Map<String, dynamic> json) => Category(json['id'] as int, json['name'] as String? ?? '');
}

class CartLine {
  CartLine(this.product, this.quantity);
  final Product product;
  int quantity;
}

class StoreApi {
  Future<dynamic> _get(String path) async {
    final response = await http.get(Uri.parse('$apiBase$path'));
    if (response.statusCode >= 400) throw Exception(_serverMessage(response, 'تعذر الاتصال بالخادم'));
    return jsonDecode(response.body);
  }
  Future<StoreData> store() async => StoreData.fromJson(await _get('/store'));
  Future<List<Category>> categories() async => (await _get('/store/categories') as List).map((item) => Category.fromJson(item)).toList();
  Future<List<Product>> products({String search = '', int? categoryId}) async {
    final query = <String, String>{if (search.isNotEmpty) 'search': search, if (categoryId != null) 'categoryId': '$categoryId'};
    final uri = Uri.parse('$apiBase/store/products').replace(queryParameters: query);
    final response = await http.get(uri);
    if (response.statusCode >= 400) throw Exception(_serverMessage(response, 'تعذر تحميل المنتجات'));
    return (jsonDecode(response.body) as List).map((item) => Product.fromJson(item)).toList();
  }
  Future<Product> product(int id) async => Product.fromJson(await _get('/store/products/$id'));
  Future<Map<String, dynamic>> createOrder(Map<String, dynamic> body) async {
    final response = await http.post(Uri.parse('$apiBase/store/orders'), headers: {'Content-Type': 'application/json'}, body: jsonEncode(body));
    if (response.statusCode >= 400) throw Exception(_serverMessage(response, 'تعذر إرسال الطلب'));
    return jsonDecode(response.body) as Map<String, dynamic>;
  }

  String _serverMessage(http.Response response, String fallback) {
    try {
      final body = jsonDecode(response.body) as Map<String, dynamic>;
      return body['error'] as String? ?? fallback;
    } catch (_) {
      return fallback;
    }
  }
}

class BastahApp extends StatefulWidget {
  const BastahApp({super.key});
  @override State<BastahApp> createState() => _BastahAppState();
}

class _BastahAppState extends State<BastahApp> {
  final api = StoreApi();
  final cart = <CartLine>[];
  int tab = 0;
  double get total => cart.fold(0, (sum, item) => sum + item.product.price * item.quantity);
  int get itemCount => cart.fold(0, (sum, item) => sum + item.quantity);
  void add(Product product) => setState(() {
        final matching = cart.where((item) => item.product.id == product.id);
        if (matching.isEmpty) {
          cart.add(CartLine(product, 1));
        } else {
          matching.first.quantity++;
        }
      });
  void update(CartLine line, int amount) => setState(() {
        line.quantity += amount;
        if (line.quantity <= 0) cart.remove(line);
      });

  @override
  Widget build(BuildContext context) => MaterialApp(
        debugShowCheckedModeBanner: false,
        title: 'بَسطة',
        theme: ThemeData(useMaterial3: true, fontFamily: 'Arial', scaffoldBackgroundColor: pageBackground, colorScheme: ColorScheme.fromSeed(seedColor: primary)),
        home: Directionality(textDirection: TextDirection.rtl, child: StoreAppShell(api: api, cart: cart, tab: tab, itemCount: itemCount, total: total, onTab: (value) => setState(() => tab = value), onAdd: add, onUpdate: update, onOrder: (body) async { final order = await api.createOrder(body); setState(cart.clear); return order; })),
      );
}

class StoreAppShell extends StatefulWidget {
  const StoreAppShell({super.key, required this.api, required this.cart, required this.tab, required this.itemCount, required this.total, required this.onTab, required this.onAdd, required this.onUpdate, required this.onOrder});
  final StoreApi api;
  final List<CartLine> cart;
  final int tab, itemCount;
  final double total;
  final ValueChanged<int> onTab;
  final ValueChanged<Product> onAdd;
  final void Function(CartLine, int) onUpdate;
  final Future<Map<String, dynamic>> Function(Map<String, dynamic>) onOrder;
  @override State<StoreAppShell> createState() => _StoreAppShellState();
}

class _StoreAppShellState extends State<StoreAppShell> {
  late Future<StoreData> store;
  late Future<List<Product>> products;
  late Future<List<Category>> categories;
  int? detailId;
  @override void initState() { super.initState(); store = widget.api.store(); products = widget.api.products(); categories = widget.api.categories(); }
  void retry() => setState(() { store = widget.api.store(); products = widget.api.products(); categories = widget.api.categories(); });

  @override
  Widget build(BuildContext context) => FutureBuilder<StoreData>(
        future: store,
        builder: (context, snapshot) {
          if (snapshot.connectionState == ConnectionState.waiting) return const LoadingScreen();
          if (snapshot.hasError) return ErrorScreen(onRetry: retry);
          final data = snapshot.data!;
          return Scaffold(
            backgroundColor: pageBackground,
            appBar: detailId == null ? StoreHeader(store: data, itemCount: widget.itemCount, onCart: () => widget.onTab(2), onProducts: () => widget.onTab(1)) : null,
            body: detailId != null
              ? ProductDetailScreen(api: widget.api, productId: detailId!, store: data, onBack: () => setState(() => detailId = null), onAdd: widget.onAdd)
              : IndexedStack(index: widget.tab, children: [HomeScreen(store: data, products: products, categories: categories, onAdd: widget.onAdd, onProducts: () => widget.onTab(1), onOpen: (id) => setState(() => detailId = id)), ProductScreen(store: data, api: widget.api, products: products, categories: categories, onAdd: widget.onAdd, onOpen: (id) => setState(() => detailId = id)), CartScreen(store: data, cart: widget.cart, total: widget.total, onUpdate: widget.onUpdate, onOrder: widget.onOrder), ProfileScreen(store: data, onProducts: () => widget.onTab(1))]),
            bottomNavigationBar: detailId == null ? FloatingBottomNav(selected: widget.tab, count: widget.itemCount, color: parseColor(data.primaryColor), onSelect: widget.onTab) : null,
          );
        },
      );
}

class StoreHeader extends StatelessWidget implements PreferredSizeWidget {
  const StoreHeader({super.key, required this.store, required this.itemCount, required this.onCart, required this.onProducts});
  final StoreData store;
  final int itemCount;
  final VoidCallback onCart, onProducts;
  @override Size get preferredSize => const Size.fromHeight(64);
  @override Widget build(BuildContext context) => AppBar(elevation: 0, backgroundColor: Colors.white.withOpacity(.94), surfaceTintColor: Colors.transparent, titleSpacing: 18, title: Row(children: [store.logoImage.isEmpty ? CircleAvatar(radius: 18, backgroundColor: parseColor(store.primaryColor), child: Text(store.name.characters.first, style: const TextStyle(color: Colors.white, fontWeight: FontWeight.w900))) : ClipRRect(borderRadius: BorderRadius.circular(12), child: storeImage(store.logoImage, width: 36, height: 36, fit: BoxFit.contain)), const SizedBox(width: 10), Text(store.name, style: const TextStyle(color: textColor, fontWeight: FontWeight.w900, fontSize: 17))]), actions: [TextButton(onPressed: () {}, child: const Text('ر.س SAR', style: TextStyle(fontSize: 11, fontWeight: FontWeight.w800, color: textColor))), TextButton(onPressed: () {}, child: const Text('EN', style: TextStyle(fontSize: 11, fontWeight: FontWeight.w800, color: textColor))), IconButton(onPressed: onProducts, icon: const Icon(Icons.search, color: textColor)), IconButton(onPressed: onCart, icon: Badge(isLabelVisible: itemCount > 0, label: Text('$itemCount'), child: const Icon(Icons.shopping_bag_outlined, color: textColor))), const SizedBox(width: 8)]);
}

class HomeScreen extends StatelessWidget {
  const HomeScreen({super.key, required this.store, required this.products, required this.categories, required this.onAdd, required this.onProducts, required this.onOpen});
  final StoreData store;
  final Future<List<Product>> products;
  final Future<List<Category>> categories;
  final ValueChanged<Product> onAdd;
  final VoidCallback onProducts;
  final ValueChanged<int> onOpen;
  @override
  Widget build(BuildContext context) => ListView(padding: const EdgeInsets.only(bottom: 110), children: [
        HeroBanner(store: store),
        CategoryStrip(categories: categories, color: parseColor(store.primaryColor), onTap: onProducts),
        SectionTitle(title: 'المنتجات المميزة', icon: Icons.auto_awesome, color: parseColor(store.primaryColor), onMore: onProducts),
        ProductGrid(products: products, featuredOnly: true, color: parseColor(store.primaryColor), onAdd: onAdd, onOpen: onOpen),
        SectionTitle(title: 'أحدث الإضافات', icon: Icons.local_offer_outlined, color: parseColor(store.primaryColor)),
        ProductGrid(products: products, featuredOnly: false, color: parseColor(store.primaryColor), onAdd: onAdd, onOpen: onOpen),
        Padding(padding: const EdgeInsets.fromLTRB(18, 22, 18, 8), child: FilledButton(onPressed: onProducts, style: FilledButton.styleFrom(backgroundColor: parseColor(store.primaryColor), minimumSize: const Size.fromHeight(52), shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16))), child: const Text('عرض جميع المنتجات', style: TextStyle(fontWeight: FontWeight.w900))),),
      ]);
}

class HeroBanner extends StatelessWidget {
  const HeroBanner({super.key, required this.store});
  final StoreData store;
  @override
  Widget build(BuildContext context) {
    final background = store.coverImage.isEmpty
        ? Container(decoration: BoxDecoration(gradient: LinearGradient(colors: [parseColor(store.primaryColor), const Color(0xFF171126)])))
        : storeImage(store.coverImage, fit: BoxFit.cover, fallback: Container(color: parseColor(store.primaryColor)));
    return SizedBox(
      height: 260,
      child: Stack(fit: StackFit.expand, children: [
        background,
        Container(color: Colors.black.withOpacity(.45)),
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 26, vertical: 20),
          child: Column(mainAxisAlignment: MainAxisAlignment.center, crossAxisAlignment: CrossAxisAlignment.start, children: [
            if (store.logoImage.isNotEmpty) ClipRRect(borderRadius: BorderRadius.circular(14), child: storeImage(store.logoImage, width: 52, height: 52, fit: BoxFit.contain)),
            const SizedBox(height: 8),
            Text(store.name, style: const TextStyle(color: Colors.white, fontSize: 28, fontWeight: FontWeight.w900)),
            Text(store.description, maxLines: 2, overflow: TextOverflow.ellipsis, style: const TextStyle(color: Colors.white70, fontSize: 13)),
            const SizedBox(height: 10),
            FilledButton(onPressed: () {}, style: FilledButton.styleFrom(backgroundColor: Colors.white, foregroundColor: parseColor(store.primaryColor), minimumSize: const Size(108, 44), padding: const EdgeInsets.symmetric(horizontal: 18), shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12))), child: const Text('تسوق الآن', style: TextStyle(fontWeight: FontWeight.w900))),
          ]),
        ),
      ]),
    );
  }
}

class CategoryStrip extends StatelessWidget {
  const CategoryStrip({super.key, required this.categories, required this.color, required this.onTap});
  final Future<List<Category>> categories;
  final Color color;
  final VoidCallback onTap;
  @override Widget build(BuildContext context) => SizedBox(height: 82, child: FutureBuilder<List<Category>>(future: categories, builder: (_, snapshot) => ListView(padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 17), scrollDirection: Axis.horizontal, children: [ActionChip(label: const Text('الكل'), onPressed: onTap, backgroundColor: color.withOpacity(.12), labelStyle: TextStyle(color: color, fontWeight: FontWeight.bold)), ...?snapshot.data?.map((category) => Padding(padding: const EdgeInsets.only(right: 8), child: ActionChip(label: Text(category.name), onPressed: onTap, backgroundColor: Colors.white, side: BorderSide.none))) ?? const []])));
}

class SectionTitle extends StatelessWidget {
  const SectionTitle({super.key, required this.title, required this.icon, required this.color, this.onMore});
  final String title;
  final IconData icon;
  final Color color;
  final VoidCallback? onMore;
  @override
  Widget build(BuildContext context) => Padding(
        padding: const EdgeInsets.fromLTRB(18, 8, 18, 12),
        child: Row(children: [
          Container(width: 34, height: 34, decoration: BoxDecoration(color: color.withOpacity(.1), borderRadius: BorderRadius.circular(11)), child: Icon(icon, size: 17, color: color)),
          const SizedBox(width: 10),
          Text(title, style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w900, color: textColor)),
          const Spacer(),
          if (onMore != null) TextButton(onPressed: onMore, child: Text('عرض الكل', style: TextStyle(color: color, fontWeight: FontWeight.bold))),
        ]),
      );
}

class ProductGrid extends StatelessWidget {
  const ProductGrid({super.key, required this.products, required this.featuredOnly, required this.color, required this.onAdd, required this.onOpen});
  final Future<List<Product>> products;
  final bool featuredOnly;
  final Color color;
  final ValueChanged<Product> onAdd;
  final ValueChanged<int> onOpen;
  @override Widget build(BuildContext context) => FutureBuilder<List<Product>>(future: products, builder: (_, snapshot) { if (snapshot.connectionState == ConnectionState.waiting) return const SizedBox(height: 240, child: Center(child: CircularProgressIndicator())); if (snapshot.hasError) return const SizedBox.shrink(); final list = (snapshot.data ?? []).where((product) => featuredOnly ? product.featured : !product.featured).take(6).toList(); if (list.isEmpty) return const SizedBox.shrink(); return GridView.builder(padding: const EdgeInsets.symmetric(horizontal: 18), shrinkWrap: true, physics: const NeverScrollableScrollPhysics(), itemCount: list.length, gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(crossAxisCount: 2, crossAxisSpacing: 14, mainAxisSpacing: 14, childAspectRatio: .63), itemBuilder: (_, index) => ProductCard(product: list[index], color: color, onAdd: onAdd, onOpen: onOpen)); });
}

class ProductCard extends StatelessWidget {
  const ProductCard({super.key, required this.product, required this.color, required this.onAdd, required this.onOpen});
  final Product product;
  final Color color;
  final ValueChanged<Product> onAdd;
  final ValueChanged<int> onOpen;
  @override Widget build(BuildContext context) => GestureDetector(onTap: () => onOpen(product.id), child: Card(elevation: 0, color: Colors.white, clipBehavior: Clip.antiAlias, shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(24)), child: Column(crossAxisAlignment: CrossAxisAlignment.stretch, children: [Expanded(child: Stack(fit: StackFit.expand, children: [product.images.isEmpty ? Container(color: color.withOpacity(.08), child: Icon(Icons.shopping_bag_outlined, color: color, size: 36)) : storeImage(product.images.first, fit: BoxFit.cover, fallback: Container(color: color.withOpacity(.08), child: Icon(Icons.shopping_bag_outlined, color: color, size: 36))), if (product.featured) const Positioned(top: 10, right: 10, child: _FeaturedBadge()), if (!product.inStock) Positioned.fill(child: Container(color: Colors.black45, child: const Center(child: Chip(label: Text('نفد المخزون'))))) ])), Padding(padding: const EdgeInsets.fromLTRB(12, 10, 12, 4), child: Text(product.name, maxLines: 2, overflow: TextOverflow.ellipsis, style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w800, color: textColor))), Padding(padding: const EdgeInsets.fromLTRB(12, 0, 12, 10), child: Row(children: [Text(formatPrice(product.price, 'SAR'), style: TextStyle(color: color, fontWeight: FontWeight.w900)), const Spacer(), IconButton(onPressed: product.inStock ? () => onAdd(product) : null, icon: Icon(Icons.shopping_bag_outlined, color: color, size: 19), style: IconButton.styleFrom(backgroundColor: color.withOpacity(.1), padding: EdgeInsets.zero, fixedSize: const Size(34, 34)))]))])));
}

class _FeaturedBadge extends StatelessWidget { const _FeaturedBadge(); @override Widget build(BuildContext context) => DecoratedBox(decoration: BoxDecoration(color: primary, borderRadius: BorderRadius.circular(20)), child: const Padding(padding: EdgeInsets.symmetric(horizontal: 8, vertical: 5), child: Text('مميز', style: TextStyle(color: Colors.white, fontSize: 9, fontWeight: FontWeight.w900)))); }

class ProductScreen extends StatefulWidget {
  const ProductScreen({super.key, required this.store, required this.api, required this.products, required this.categories, required this.onAdd, required this.onOpen});
  final StoreData store;
  final StoreApi api;
  final Future<List<Product>> products;
  final Future<List<Category>> categories;
  final ValueChanged<Product> onAdd;
  final ValueChanged<int> onOpen;
  @override State<ProductScreen> createState() => _ProductScreenState();
}
class _ProductScreenState extends State<ProductScreen> {
  String search = '';
  int? category;
  late Future<List<Product>> filtered;
  @override void initState() { super.initState(); filtered = widget.products; }
  void apply() => setState(() => filtered = widget.api.products(search: search, categoryId: category));
  @override Widget build(BuildContext context) => ListView(padding: const EdgeInsets.only(bottom: 110), children: [Padding(padding: const EdgeInsets.fromLTRB(18, 18, 18, 12), child: const Text('المنتجات', style: TextStyle(fontSize: 25, fontWeight: FontWeight.w900, color: textColor))), Padding(padding: const EdgeInsets.symmetric(horizontal: 18), child: TextField(onChanged: (value) { search = value; apply(); }, decoration: InputDecoration(prefixIcon: const Icon(Icons.search), hintText: 'ابحث عن منتج...', filled: true, fillColor: Colors.white, border: OutlineInputBorder(borderRadius: BorderRadius.circular(18), borderSide: BorderSide.none)))), const SizedBox(height: 12), CategoryStrip(categories: widget.categories, color: parseColor(widget.store.primaryColor), onTap: () { category = null; apply(); }), ProductGrid(products: filtered, featuredOnly: false, color: parseColor(widget.store.primaryColor), onAdd: widget.onAdd, onOpen: widget.onOpen)]);
}

class CartScreen extends StatefulWidget {
  const CartScreen({super.key, required this.store, required this.cart, required this.total, required this.onUpdate, required this.onOrder});
  final StoreData store;
  final List<CartLine> cart;
  final double total;
  final void Function(CartLine, int) onUpdate;
  final Future<Map<String, dynamic>> Function(Map<String, dynamic>) onOrder;
  @override State<CartScreen> createState() => _CartScreenState();
}
class _CartScreenState extends State<CartScreen> {
  final formKey = GlobalKey<FormState>();
  final name = TextEditingController(), phone = TextEditingController(), address = TextEditingController();
  bool sending = false;
  @override Widget build(BuildContext context) { final color = parseColor(widget.store.primaryColor); if (widget.cart.isEmpty) return ListView(padding: const EdgeInsets.only(bottom: 110), children: [const Padding(padding: EdgeInsets.fromLTRB(18, 22, 18, 8), child: Text('السلة', style: TextStyle(fontSize: 25, fontWeight: FontWeight.w900))), const SizedBox(height: 100), Icon(Icons.shopping_bag_outlined, size: 58, color: color.withOpacity(.3)), const SizedBox(height: 14), const Center(child: Text('السلة فارغة', style: TextStyle(fontSize: 19, fontWeight: FontWeight.w900))), const SizedBox(height: 8), const Center(child: Text('أضف منتجات لسلتك للبدء في التسوق', style: TextStyle(color: Colors.grey))) ]); final lines = widget.cart.map((line) => CartLineCard(line: line, color: color, onUpdate: widget.onUpdate)).toList(); return ListView(padding: const EdgeInsets.fromLTRB(18, 20, 18, 110), children: [const Text('السلة', style: TextStyle(fontSize: 25, fontWeight: FontWeight.w900)), const SizedBox(height: 5), Text('${widget.cart.fold(0, (sum, line) => sum + line.quantity)} منتجات', style: const TextStyle(color: Colors.grey)), const SizedBox(height: 16), ...lines, const SizedBox(height: 15), Container(padding: const EdgeInsets.all(18), decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(20)), child: Column(children: [_summary('المجموع الفرعي', widget.total), _summary('الشحن', widget.store.shippingRate), const Divider(height: 24), _summary('الإجمالي', widget.total + widget.store.shippingRate, bold: true, color: color)])), const SizedBox(height: 20), const Text('بيانات التوصيل', style: TextStyle(fontSize: 18, fontWeight: FontWeight.w900)), const SizedBox(height: 10), Form(key: formKey, child: Column(children: [_field(name, 'الاسم الكامل'), _field(phone, 'رقم الجوال', type: TextInputType.phone), _field(address, 'العنوان'), SizedBox(width: double.infinity, child: FilledButton(onPressed: sending ? null : () => submit(color), style: FilledButton.styleFrom(backgroundColor: color, minimumSize: const Size.fromHeight(52), shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16))), child: Text(sending ? 'جارٍ الإرسال...' : 'إتمام الطلب', style: const TextStyle(fontWeight: FontWeight.w900))))]))]); }
  Widget _field(TextEditingController controller, String label, {TextInputType? type}) => Padding(padding: const EdgeInsets.only(bottom: 10), child: TextFormField(controller: controller, keyboardType: type, validator: (value) => value == null || value.trim().isEmpty ? 'هذا الحقل مطلوب' : null, decoration: InputDecoration(labelText: label, filled: true, fillColor: Colors.white, border: OutlineInputBorder(borderRadius: BorderRadius.circular(15), borderSide: BorderSide.none))));
  Widget _summary(String label, double value, {bool bold = false, Color? color}) => Padding(padding: const EdgeInsets.symmetric(vertical: 4), child: Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [Text(label, style: TextStyle(fontWeight: bold ? FontWeight.w900 : FontWeight.normal)), Text('${value.toStringAsFixed(2)} ر.س', style: TextStyle(fontWeight: FontWeight.w900, fontSize: bold ? 20 : 14, color: color ?? textColor))]));
  Future<void> submit(Color color) async { if (!formKey.currentState!.validate()) return; setState(() => sending = true); try { final order = await widget.onOrder({'customerName': name.text, 'customerPhone': phone.text, 'customerAddress': address.text, 'notes': '', 'items': widget.cart.map((line) => {'productId': line.product.id, 'quantity': line.quantity}).toList()}); if (mounted) ScaffoldMessenger.of(context).showSnackBar(SnackBar(backgroundColor: color, content: Text('تم استلام طلبك رقم ${order['orderNumber'] ?? order['id']}'))); } catch (_) { if (mounted) ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('تعذر إرسال الطلب، حاول مرة أخرى'))); } finally { if (mounted) setState(() => sending = false); } }
}

class CartLineCard extends StatelessWidget {
  const CartLineCard({super.key, required this.line, required this.color, required this.onUpdate});
  final CartLine line;
  final Color color;
  final void Function(CartLine, int) onUpdate;
  @override Widget build(BuildContext context) => Container(margin: const EdgeInsets.only(bottom: 12), padding: const EdgeInsets.all(12), decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(18), boxShadow: const [BoxShadow(color: Color(0x0A000000), blurRadius: 12)]), child: Row(children: [ClipRRect(borderRadius: BorderRadius.circular(12), child: line.product.images.isEmpty ? Container(width: 82, height: 92, color: color.withOpacity(.08), child: Icon(Icons.shopping_bag_outlined, color: color)) : storeImage(line.product.images.first, width: 82, height: 92, fit: BoxFit.cover)), const SizedBox(width: 12), Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [Text(line.product.name, maxLines: 2, overflow: TextOverflow.ellipsis, style: const TextStyle(fontWeight: FontWeight.w800)), const SizedBox(height: 18), Row(children: [Text(formatPrice(line.product.price * line.quantity, 'SAR'), style: TextStyle(color: color, fontWeight: FontWeight.w900)), const Spacer(), Container(decoration: BoxDecoration(color: pageBackground, borderRadius: BorderRadius.circular(30)), child: Row(children: [IconButton(onPressed: () => onUpdate(line, -1), icon: const Icon(Icons.remove, size: 16)), Text('${line.quantity}', style: const TextStyle(fontWeight: FontWeight.w900)), IconButton(onPressed: () => onUpdate(line, 1), icon: Icon(Icons.add, size: 16, color: color))]))])]))]));
}

class ProductDetailScreen extends StatefulWidget {
  const ProductDetailScreen({super.key, required this.api, required this.productId, required this.store, required this.onBack, required this.onAdd});
  final StoreApi api;
  final int productId;
  final StoreData store;
  final VoidCallback onBack;
  final ValueChanged<Product> onAdd;
  @override State<ProductDetailScreen> createState() => _ProductDetailScreenState();
}

class _ProductDetailScreenState extends State<ProductDetailScreen> {
  late Future<Product> product;
  String? size;
  String? color;
  @override void initState() { super.initState(); product = widget.api.product(widget.productId); }
  @override Widget build(BuildContext context) => FutureBuilder<Product>(future: product, builder: (context, snapshot) {
        if (snapshot.connectionState == ConnectionState.waiting) return const Center(child: CircularProgressIndicator());
        if (snapshot.hasError || snapshot.data == null) return Center(child: Column(mainAxisSize: MainAxisSize.min, children: [const Icon(Icons.inventory_2_outlined, size: 48, color: Colors.grey), const SizedBox(height: 12), const Text('المنتج غير موجود'), TextButton(onPressed: widget.onBack, child: const Text('العودة للمنتجات'))]));
        final item = snapshot.data!;
        final themeColor = parseColor(widget.store.primaryColor);
        return Stack(children: [ListView(padding: const EdgeInsets.only(bottom: 110), children: [Stack(children: [SizedBox(height: 330, width: double.infinity, child: item.images.isEmpty ? Container(color: themeColor.withOpacity(.08), child: Icon(Icons.shopping_bag_outlined, size: 60, color: themeColor)) : storeImage(item.images.first, fit: BoxFit.cover, fallback: Container(color: themeColor.withOpacity(.08)))), Positioned(top: 18, right: 18, child: CircleAvatar(backgroundColor: Colors.white.withOpacity(.92), child: IconButton(onPressed: widget.onBack, icon: const Icon(Icons.arrow_forward, color: textColor))))]), Padding(padding: const EdgeInsets.all(22), child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [Container(padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 7), decoration: BoxDecoration(color: item.inStock ? const Color(0xFFDCFCE7) : const Color(0xFFFEE2E2), borderRadius: BorderRadius.circular(20)), child: Text(item.inStock ? 'متوفر' : 'غير متوفر', style: TextStyle(color: item.inStock ? Colors.green.shade700 : Colors.red, fontWeight: FontWeight.bold, fontSize: 12))), const SizedBox(height: 12), Text(item.name, style: const TextStyle(fontSize: 27, fontWeight: FontWeight.w900, color: textColor)), const SizedBox(height: 8), Row(children: [const Icon(Icons.star, size: 18, color: Colors.amber), const Text(' 4.5  (38)', style: TextStyle(fontWeight: FontWeight.bold, color: Colors.grey))]), const SizedBox(height: 12), Text(formatPrice(item.price, widget.store.currency), style: TextStyle(fontSize: 30, fontWeight: FontWeight.w900, color: themeColor)), if (item.description.isNotEmpty) Container(width: double.infinity, margin: const EdgeInsets.only(top: 20), padding: const EdgeInsets.all(16), decoration: BoxDecoration(color: themeColor.withOpacity(.06), borderRadius: BorderRadius.circular(18)), child: Text(item.description, style: const TextStyle(color: Colors.black54, height: 1.6))), if (item.sizes.isNotEmpty) _options('اختر المقاس', item.sizes, size, (value) => setState(() => size = value), themeColor), if (item.colors.isNotEmpty) _options('اختر اللون', item.colors, color, (value) => setState(() => color = value), themeColor)]))]), Positioned(bottom: 0, left: 0, right: 0, child: SafeArea(child: Container(padding: const EdgeInsets.fromLTRB(18, 12, 18, 12), color: Colors.white, child: FilledButton.icon(onPressed: item.inStock ? () { widget.onAdd(item); ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('تمت الإضافة للسلة ✓'))); } : null, icon: const Icon(Icons.shopping_bag_outlined), label: Text(item.inStock ? 'أضف للسلة' : 'نفد المخزون'), style: FilledButton.styleFrom(backgroundColor: themeColor, minimumSize: const Size.fromHeight(52), shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16))))))) ]);
      });
  Widget _options(String title, List<String> values, String? selected, ValueChanged<String> onSelect, Color color) => Padding(padding: const EdgeInsets.only(top: 22), child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [Text(title, style: const TextStyle(fontWeight: FontWeight.w900)), const SizedBox(height: 10), Wrap(spacing: 8, children: values.map((value) => ChoiceChip(label: Text(value), selected: selected == value, selectedColor: color, labelStyle: TextStyle(color: selected == value ? Colors.white : textColor), onSelected: (_) => onSelect(value))).toList())]));
}

class ProfileScreen extends StatelessWidget {
  const ProfileScreen({super.key, required this.store, required this.onProducts});
  final StoreData store;
  final VoidCallback onProducts;
  @override
  Widget build(BuildContext context) {
    final color = parseColor(store.primaryColor);
    return ListView(padding: const EdgeInsets.only(bottom: 110), children: [
      SizedBox(height: 190, child: Stack(fit: StackFit.expand, children: [
        store.coverImage.isEmpty ? Container(decoration: BoxDecoration(gradient: LinearGradient(colors: [color, color.withOpacity(.55)]))) : storeImage(store.coverImage, fit: BoxFit.cover),
        Container(color: Colors.black38),
        Align(alignment: Alignment.bottomCenter, child: CircleAvatar(radius: 42, backgroundColor: color, child: store.logoImage.isEmpty ? Text(store.name.characters.first, style: const TextStyle(color: Colors.white, fontSize: 30, fontWeight: FontWeight.w900)) : ClipOval(child: storeImage(store.logoImage, width: 84, height: 84)))),
      ])),
      const SizedBox(height: 52),
      Center(child: Text(store.name, style: const TextStyle(fontSize: 25, fontWeight: FontWeight.w900))),
      Padding(padding: const EdgeInsets.all(18), child: Text(store.description, textAlign: TextAlign.center, style: const TextStyle(color: Colors.grey))),
      const Divider(indent: 18, endIndent: 18),
      _profileTile(Icons.language, 'اللغة', 'العربية', color),
      _profileTile(Icons.currency_exchange, 'العملة', store.currency, color),
      if (store.whatsappNumber.isNotEmpty) _profileTile(Icons.chat_outlined, 'واتساب', store.whatsappNumber, color),
      Padding(padding: const EdgeInsets.all(18), child: FilledButton.icon(onPressed: onProducts, icon: const Icon(Icons.shopping_bag_outlined), label: const Text('تسوق الآن'), style: FilledButton.styleFrom(backgroundColor: color, minimumSize: const Size.fromHeight(52), shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16))))),
    ]);
  }
  Widget _profileTile(IconData icon, String title, String value, Color color) => ListTile(leading: Icon(icon, color: color), title: Text(title, style: const TextStyle(fontWeight: FontWeight.bold)), trailing: Text(value, style: const TextStyle(color: Colors.grey)));
}

class FloatingBottomNav extends StatelessWidget {
  const FloatingBottomNav({super.key, required this.selected, required this.count, required this.color, required this.onSelect});
  final int selected, count;
  final Color color;
  final ValueChanged<int> onSelect;
  @override Widget build(BuildContext context) => SafeArea(child: Padding(padding: const EdgeInsets.fromLTRB(16, 0, 16, 12), child: Container(height: 68, decoration: BoxDecoration(color: Colors.white.withOpacity(.94), borderRadius: BorderRadius.circular(34), boxShadow: const [BoxShadow(color: Color(0x18000000), blurRadius: 28, offset: Offset(0, 8))]), child: Row(mainAxisAlignment: MainAxisAlignment.spaceEvenly, children: [_nav(0, Icons.home_outlined, 'الرئيسية'), _nav(1, Icons.grid_view_outlined, 'المنتجات'), _nav(2, Icons.shopping_bag_outlined, 'السلة', badge: count), _nav(3, Icons.person_outline, 'حسابي')]))) );
  Widget _nav(int index, IconData icon, String label, {int badge = 0}) => GestureDetector(onTap: () => onSelect(index), child: SizedBox(width: 78, child: Column(mainAxisAlignment: MainAxisAlignment.center, children: [Badge(isLabelVisible: badge > 0, label: Text('$badge'), child: Icon(icon, color: selected == index ? color : const Color(0xFF6B7280))), const SizedBox(height: 3), Text(label, style: TextStyle(fontSize: 9, fontWeight: selected == index ? FontWeight.w900 : FontWeight.normal, color: selected == index ? color : const Color(0xFF6B7280)))])));
}

class LoadingScreen extends StatelessWidget { const LoadingScreen({super.key}); @override Widget build(BuildContext context) => const Scaffold(body: Center(child: CircularProgressIndicator())); }
class ErrorScreen extends StatelessWidget { const ErrorScreen({super.key, required this.onRetry}); final VoidCallback onRetry; @override Widget build(BuildContext context) => Scaffold(body: Center(child: Padding(padding: const EdgeInsets.all(24), child: Column(mainAxisSize: MainAxisSize.min, children: [const Icon(Icons.cloud_off_rounded, size: 55, color: Colors.grey), const SizedBox(height: 16), const Text('تعذر تحميل المتجر', style: TextStyle(fontWeight: FontWeight.w900, fontSize: 17)), const SizedBox(height: 8), const Text('تأكد من تشغيل الخادم وضبط DATABASE_URL في ملف البيئة، ثم أعد المحاولة.', textAlign: TextAlign.center, style: TextStyle(color: Colors.grey)), const SizedBox(height: 18), FilledButton(onPressed: onRetry, child: const Text('إعادة المحاولة'))])))); }
Color parseColor(String value) { final hex = value.replaceAll('#', ''); return Color(int.parse('FF${hex.length == 6 ? hex : '7C3AED'}', radix: 16)); }

String formatPrice(double amount, String currency) {
  const rates = {'USD': 1.0, 'SAR': 3.75, 'YER': 250.0, 'AED': 3.67, 'EUR': .92, 'GBP': .79};
  const symbols = {'USD': '\$', 'SAR': 'ر.س', 'YER': '﷼', 'AED': 'د.إ', 'EUR': '€', 'GBP': '£'};
  final code = rates.containsKey(currency) ? currency : 'SAR';
  return '${symbols[code]}${(amount * rates[code]!).toStringAsFixed(0)}';
}

Widget storeImage(String source, {double? width, double? height, BoxFit fit = BoxFit.cover, Widget? fallback}) {
  if (source.startsWith('data:image/')) {
    try {
      final comma = source.indexOf(',');
      return Image.memory(base64Decode(source.substring(comma + 1)), width: width, height: height, fit: fit, errorBuilder: (_, __, ___) => fallback ?? const SizedBox.shrink());
    } catch (_) {
      return fallback ?? const SizedBox.shrink();
    }
  }
  return Image.network(source, width: width, height: height, fit: fit, errorBuilder: (_, __, ___) => fallback ?? const SizedBox.shrink());
}
