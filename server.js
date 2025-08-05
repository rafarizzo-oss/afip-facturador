// server.js
const express = require('express');
const cors = require('cors');
const Afip = require('@afipsdk/afip.js');

const app = express();
app.use(cors());
app.use(express.json());

const afip = new Afip({ CUIT: 20409378472 }); // CUIT de prueba para entorno dev

app.post('/emitir-factura', async (req, res) => {
  try {
    const { puntoVenta, tipoCbte, docTipo, docNro, importe } = req.body;

    // Obtener último comprobante autorizado
    const ultimo = await afip.ElectronicBilling.getLastVoucher(puntoVenta, tipoCbte);
    const siguiente = ultimo + 1;

    const data = {
      CantReg: 1,
      PtoVta: puntoVenta,
      CbteTipo: tipoCbte,
      Concepto: 1,
      DocTipo: docTipo,
      DocNro: docNro,
      CbteDesde: siguiente,
      CbteHasta: siguiente,
      CbteFch: new Date().toISOString().slice(0, 10).replace(/-/g, ''),
      ImpTotal: importe,
      ImpNeto: importe,
      ImpIVA: +(importe * 0.21).toFixed(2),
      MonId: 'PES',
      MonCotiz: 1,
      CbteModalidad: 1,
      TipoResp: 1,
      Iva: [
        {
          Id: 5,
          BaseImp: importe,
          Importe: +(importe * 0.21).toFixed(2),
        },
      ],
    };

    const response = await afip.ElectronicBilling.createVoucher(data);

    res.json({
      resultado: response.FeDetResp?.FECAEDetResponse?.[0]?.Resultado,
      cae: response.FeDetResp?.FECAEDetResponse?.[0]?.CAE,
      vencimiento: response.FeDetResp?.FECAEDetResponse?.[0]?.CAEFchVto,
      nroComprobante: siguiente
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
});
