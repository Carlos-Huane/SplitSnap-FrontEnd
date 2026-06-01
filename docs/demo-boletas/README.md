# Boletas demo para SplitSnap OCR

Plan B para la exposición. Si una boleta real no es leída bien por el OCR
(Google Cloud Vision + el parser del backend), abre una de estas, captura a
JPG/PNG, súbela al scan y va a funcionar.

Cada boleta usa una keyword distinta para cubrir varias rutas del regex:

| Archivo                        | Negocio                | Keyword principal       | Total       |
|--------------------------------|------------------------|-------------------------|-------------|
| `boleta-restaurant.html`       | Restaurant criollo     | `TOTAL A PAGAR`         | S/ 162.00   |
| `boleta-supermercado.html`     | Supermercado           | `IMPORTE TOTAL`         | S/  99.50   |
| `boleta-bodega.html`           | Bodega de abarrotes    | `PRECIO VENTA`          | S/  47.00   |

## Cómo convertirlas a JPG (Windows)

1. Abre el archivo HTML en Chrome o Edge (doble click).
2. Recorta con **Snipping Tool** (`Win + Shift + S`):
   - Selecciona desde el borde superior del ticket hasta el inferior.
   - Se copia al portapapeles automáticamente.
3. Abre **Paint**, pega (`Ctrl + V`), y guarda como `.jpg` o `.png`.

Tip: para que Google Vision lea mejor, asegúrate de que el ticket ocupe casi
toda la captura (sin mucho fondo gris alrededor).

## Cómo se ven (vista rápida del primer ticket)

```
        EL HORNO PERUANO
       Restaurant Criollo
     Av. Larco 123, Miraflores
        RUC: 20512345678
        Telf: 01-555-1234
--------------------------------
BOLETA DE VENTA ELECTRONICA
B001-001234
FECHA: 01/06/2026  HORA: 13:45
CAJERO: MARIA L.
--------------------------------
1 LOMO SALTADO             38.00
1 AJI DE GALLINA           32.00
1 CAUSA LIMENA             28.00
1 CHICHA MORADA JARRA      18.00
2 INCA KOLA 500ML          16.00
2 POSTRE SUSPIRO           30.00
--------------------------------
VALOR VENTA          S/ 137.29
I.G.V. 18%           S/  24.71
--------------------------------
TOTAL A PAGAR        S/ 162.00
--------------------------------
SON: CIENTO SESENTA Y DOS CON 00/100 SOLES
PAGO: EFECTIVO

      ¡GRACIAS POR SU VISITA!
```

## Si AÚN así falla el OCR

El frontend tiene fallback: cuando `detectedAmount` es 0, muestra un banner
amarillo arriba del formulario diciendo "No detectamos el monto
automáticamente — revisa el texto e ingresa el monto manualmente". Puedes
mostrarlo en vivo durante el demo y tipear el total a mano. Eso también es
parte del flujo válido (HU-4.5 contempla edición manual posterior al scan).
