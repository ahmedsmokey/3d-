---
name: Implement Django Feature
description: Standard procedure from Model creation to API Endpoint.
---

# Skill: Implement Django Feature

## 1. Domain Modeling (The Foundation)
**Always start here.**
- Create/Update `models.py`.
- Enforce `id = models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True)`.
- Add `created_at` and `updated_at` (TimeStamped).
- Define `__str__` method.

## 2. Business Logic Layer
**Do not put heavy logic in Views.**
- Create a `services.py` or `selectors.py` in the app.
- `selectors.py`: For fetching data (QuerySets, filtering).
- `services.py`: For writing data (Transactions, complex creates).

## 3. API Interface (DRF)
- **Serializer**:
    - Use `ModelSerializer` by default.
    - Explicitly list `fields` (or use `fields = '__all__'` only for prototyping).
- **View**:
    - Use `rest_framework.generics` or `viewsets`.
    - Apply `permission_classes`.
    - Apply `filter_backends` (DjangoFilterBackend, SearchFilter).
- **URL**:
    - Register in `urls.py`. Use the router if using ViewSets.

## 4. Admin Panel
- Don't forget `admin.py`.
- Use `@admin.register(Model)`.
- Define `list_display`, `search_fields`, `list_filter`.

## 5. Testing
- Create a test file `tests/test_[feature].py`.
- Implement user happy path (201 Created / 200 OK).
