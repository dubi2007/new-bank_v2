# Guía para Simplificar Estilos

## Cambios a realizar en todos los componentes:

### Remover/Reemplazar:
1. `border-2 border-blue-200` → Remover (PrimeReact maneja bordes)
2. `border-2 border-purple-200` → Remover
3. `border-2 border-orange-200` → Remover
4. `border-2 border-emerald-200` → Remover
5. `border-2 border-green-200` → Remover
6. `border-l-4 border-blue-500` → Remover
7. `border-l-4 border-purple-500` → Remover
8. `border-l-4 border-emerald-500` → Remover
9. `border-l-4 border-indigo-500` → Remover
10. `border-l-4 border-green-500` → Remover
11. `border-l-4 border-orange-500` → Remover
12. `bg-gradient-to-r from-X-50 to-Y-50` → `bg-gray-50` o remover
13. `hover:border-X-400 focus:border-X-500` → Remover (PrimeReact maneja)

### Mantener:
- Clases de espaciado (p-, m-, gap-)
- Clases de grid y flex
- Clases de sombra básicas (shadow-sm, shadow-md)
- Clases de redondeo (rounded-lg, rounded-xl)
- Transiciones y hover básicos

## Archivos a modificar:
1. src/pages/DashboardPage.tsx
2. src/components/AccountOperations.tsx
3. src/components/UserInfoModal.tsx
4. src/pages/LoginPage.tsx (solo input borders)
