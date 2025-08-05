// server.js
const express = require('express');
const cors = require('cors');
const Afip = require('@afipsdk/afip.js');

const app = express();
app.use(cors());
app.use(express.json());

const afip = new Afip({ CUIT: 20409378472 }); // Modo dev sin certificado

app.post('/emitir-factura', async (req, res) => {
  try {
    const { puntoVenta, tipoCbte, docTipo, docNro, importe } = req.body;

    const data = {
      CantReg: 1,
      PtoVta: puntoVenta,
      CbteTipo: tipoCbte,
      Concepto: 1, // Productos
      DocTipo: docTipo,
      DocNro: docNro,
      CbteDesde: 1,
      CbteHasta: 1,
      CbteFch: new Date().toISOString().slice(0, 10).replace(/-/g, ''),
      ImpTotal: importe,
      ImpNeto: importe,
      ImpIVA: +(importe * 0.21).toFixed(2),
      MonId: 'PES',
      MonCotiz: 1,
      Iva: [
        {
          Id: 5, // 21%
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
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
});
