const QRCode = require('qrcode');

const generateUPILink = (amount, txnNote) => {
    const vpa = process.env.UPI_VPA || 'amtippu@ybl';
    const name = 'AM-Tippu Fitness';
    // upi://pay?pa={vpa}&pn={name}&am={amount}&tn={note}
    const upiLink = `upi://pay?pa=${encodeURIComponent(vpa)}&pn=${encodeURIComponent(name)}&am=${amount}&tn=${encodeURIComponent(txnNote)}`;
    return upiLink;
};

const generateQRCode = async (upiLink) => {
    try {
        const qrBase64 = await QRCode.toDataURL(upiLink);
        return qrBase64;
    } catch (err) {
        console.error('QR code generation failed:', err);
        return null;
    }
};

module.exports = { generateUPILink, generateQRCode };
