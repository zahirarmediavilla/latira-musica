// Cierre del overlay al volver a la home. En navegación soft (client-side) un
// slot de ruta paralela que deja de coincidir NO se limpia solo: sigue mostrando
// lo último que renderizó. Como la ficha se cierra con `router.push("/")`
// (BackHeader), sin un page.tsx que empareje "/" el slot `@modal` se quedaba con
// el overlay montado (fixed inset-0) tapando la lista, y no se podía abrir otra
// ficha. Este page.tsx empareja la home y devuelve null, cerrando el overlay.
export default function Default() {
  return null;
}
