const apiUrl = "https://apify.epayco.co";

// Obtener el token de autenticación desde localStorage
let authToken = localStorage.getItem("authToken");
const cardNumber = document.getElementById("card-number");
const amount = document.getElementById("amount");

//formatear valor de la tarjeta
cardNumber.addEventListener("input", (e) => {
  let ValueCardNumber = e.target.value;
  cardNumber.value = ValueCardNumber.replace(/\s/g, "")
    .replace(/\D/g, "")
    .replace(/([0-9]{4})/g, "$1 ")
    .trim();
});

function formatCurrency(value) {
  // Elimina cualquier carácter no numérico
  const numericValue = value.replace(/\D/g, "");

  // Limita el número máximo de dígitos a 9
  const limitedValue = numericValue.substring(0, 9);

  // Aplica formato de miles
  return limitedValue.replace(/\B(?=(\d{3})+(?!\d))/g, "."); // Agrega puntos para separar miles
}

// Evento para formatear el valor en el input mientras el usuario escribe
amount.addEventListener("input", (e) => {
  const input = e.target;

  // Guarda la posición inicial del cursor
  const cursorPosition = input.selectionStart;

  // Valor ingresado por el usuario
  const rawValue = input.value;

  // Formatea el valor ingresado
  const formattedValue = formatCurrency(rawValue);

  // Actualiza el campo de entrada con el valor formateado
  input.value = formattedValue;

  // Ajusta la posición del cursor para evitar movimientos inesperados
  const diff = formattedValue.length - rawValue.length;
  input.setSelectionRange(cursorPosition + diff, cursorPosition + diff);
});

// Función para obtener el valor limpio sin puntos ni formato
function getPaymentAmount() {
  const valueTotal = amount.value.replace(/\./g, ""); // Elimina los puntos y retorna solo los números
  return valueTotal;
}

//Crear token de la tarjeta
async function createCardToken(cardNumber, expYear, expMonth, cvv) {
  const response = await fetch(`${apiUrl}/token/card`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${authToken}`,
    },
    body: JSON.stringify({
      cardNumber: cardNumber,
      cardExpYear: expYear,
      cardExpMonth: expMonth,
      cardCvc: cvv,
    }),
  });

  const data = await response.json();
  if (response.ok) {
    const tokenCard = data.data.id;
    return tokenCard;
  } else {
    throw new Error(data.message || "Error al crear el token de tarjeta");
  }
}

//Procesar pago
async function processPayment(paymentData) {

  const response = await fetch(`${apiUrl}/payment/process`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${authToken}`,
    },
    body: JSON.stringify(paymentData),
    maxRedirects: 20,
  });

  const data = await response.json();
  if (response.ok) {

    const transactionData = data.data.transaction.data;
    console.log(transactionData);

    if (transactionData["3DS"] !== undefined) {
      console.log(transactionData["3DS"]);
      const data3DS = {
        "franquicia": transactionData.franquicia,
        "3DS": transactionData["3DS"],
        "ref_payco": transactionData.ref_payco,
        "cc_network_response": transactionData.cc_network_response,
      };
      // En este punto enviara el objeto data3DS al método de validación
      validate3ds(data3DS);
    }
      const refPayco = transactionData.ref_payco;
      const state = transactionData.estado;
      const bankName = transactionData.banco;
      const amount = transactionData.valor;
      const description = transactionData.descripcion;
      const date = transactionData.fecha;
      const bill =  transactionData.factura;
 
      const urlResponse = `http://127.0.0.1:5500/src/respuesta.html?ref_payco=${refPayco}&estado=${state}&banco=${bankName}&valor=${amount}&descripcion=${description}&fecha=${date}&factura=${bill}`;
      window.location.href = urlResponse;
    return data;
  } else {
    throw new Error(data.message || "Error al procesar el pago");
  }
}

//Funcion de pago
document.getElementById("pay-button").addEventListener("click", async () => {
  try {
    const name = document.getElementById("name").value;
    const lastName = document.getElementById("lastName").value;
    const docType = document.getElementById("doc-type").value;
    const docNumber = document.getElementById("doc-number").value;
    const email = document.getElementById("email").value;
    const phone = document.getElementById("phone").value;
    const telPhone = "0000000";

    const expirationMonth = document.getElementById("expiration-month").value;
    const expirationYear = document.getElementById("expiration-year").value;
    const cvv = document.getElementById("cvv").value;

    const dues = document.getElementById("dues").value;
    const cleancardNumber = cardNumber.value.replace(/\s/g, "");

    //Obtener el valor al hacer clic en un botón
    const paymentAmount = getPaymentAmount(); // Obtiene el valor como string limpio

    //Generar token
    const publicKey = '25bd67a9d26a7c74c410c7707db652fd'
    const privateKey = '0d03d6facb8df947a0ddd5b7608dca7c';
    const token = btoa(`${publicKey}:${privateKey}`)

    try {
      const response = await fetch(`${apiUrl}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          authorization: `Basic ${token}}`
        },
      });

      const data = await response.json();
      if (response.ok) {
        // Guardar el token en localStorage
        localStorage.setItem('authToken', data.token);
        authToken = data.token
      } else {
        throw new Error(data.message || 'Error al iniciar sesión');
      }
    } catch (error) {
      console.error(`Error: ${error.message}`);
    }

    // Crear token de la tarjeta
    const cardTokenId = await createCardToken(
      cleancardNumber,
      expirationYear,
      expirationMonth,
      cvv
    );

    // Procesar pago
    await processPayment({
      value: paymentAmount,
      docType: docType,
      docNumber: docNumber,
      name: name,
      lastName: lastName,
      email: email,
      cellPhone: phone,
      phone: telPhone,
      cardNumber: cleancardNumber,
      cardExpYear: expirationYear,
      cardExpMonth: expirationMonth,
      cardCvc: cvv,
      dues: dues,
      urlResponse: 'http://127.0.0.1:5500/src/respuesta.html',
      urlConfirmation: 'https://webhook.site/dfc13dce-0581-4399-aa1f-2c975f71fc27',
      _cardTokenId: cardTokenId
    });
  } catch (error) {
    console.log(`Error: ${error.message}`);
  }
});