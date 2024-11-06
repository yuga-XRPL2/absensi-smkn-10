const locationThreshold = 3; // radius dalam km
const latSchool = -6.9664242;
const longSchool = 110.4020143;
let usedPhotos = new Set(); // Menyimpan foto yang sudah digunakan

function validateForm() {
    const tanggal = document.getElementById("tanggal").value;
    const jam = document.getElementById("jam").value;
    const foto = document.getElementById("foto").files[0];
    const status = document.getElementById("status").value; // Ambil nilai status

    // Validasi waktu saat ini dengan waktu input
    const now = new Date();
    const inputTime = new Date(`${tanggal}T${jam}`);

    if (inputTime.getFullYear() !== now.getFullYear() ||
        inputTime.getMonth() !== now.getMonth() ||
        inputTime.getDate() !== now.getDate() ||
        inputTime.getHours() !== now.getHours() ||
        inputTime.getMinutes() !== now.getMinutes()) {
        showMessage("Tanggal dan jam tidak sesuai dengan waktu pengisian.");
        return false;
    }

    // Cek jam hadir dan tentukan status
    const inputHours = inputTime.getHours();
    const inputMinutes = inputTime.getMinutes();
    let finalStatus = "hadir"; // Default status

    if (inputHours < 5 || (inputHours === 7 && inputMinutes > 15) || inputHours > 7) {
        finalStatus = "terlambat"; // Jika di luar jam, set status menjadi terlambat
    }

    // Validasi foto
    if (foto) {
        const reader = new FileReader();
        reader.onloadend = function () {
            const photoHash = reader.result; // Dapatkan data base64 foto
            if (usedPhotos.has(photoHash)) {
                showMessage("Foto ini sudah pernah digunakan.");
                return false;
            }
            usedPhotos.add(photoHash); // Tambahkan hash foto ke set
            
            // Jika status adalah 'izin', lewati validasi lokasi
            if (status === "izin") {
                showMessage("Presensi izin berhasil!", "green");
                addToLaporan(); // Menambahkan ke laporan
                document.getElementById("presensiForm").reset();
                return true;
            } else {
                // Update status kehadiran dengan status final
                document.getElementById("finalStatus").value = finalStatus;
                checkLocationAndSubmit(); // Cek lokasi setelah validasi foto
            }
        }
        reader.readAsDataURL(foto); // Baca file sebagai Data URL
        return false; // Mencegah form dari pengiriman otomatis
    }

    return false; // Jika tidak ada foto, batalkan pengiriman
}

function checkLocationAndSubmit() {
    // Validasi lokasi
    if (!navigator.geolocation) {
        showMessage("Geolocation tidak didukung di browser ini.");
        return false;
    }
    navigator.geolocation.getCurrentPosition(position => {
        const distance = calculateDistance(position.coords.latitude, position.coords.longitude, latSchool, longSchool);
        if (distance > locationThreshold) {
            showMessage("Anda berada di luar zona presensi.");
            return false;
        } else {
            showMessage("Presensi berhasil!", "green");
            addToLaporan(); // Menambahkan ke laporan
            document.getElementById("presensiForm").reset();
            return true;
        }
    }, () => {
        showMessage("Tidak dapat mengambil lokasi.");
        return false;
    });
}

function showMessage(message, color = "red") {
    const messageDiv = document.getElementById("message");
    messageDiv.textContent = message;
    messageDiv.style.color = color;
}

function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Radius bumi dalam km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Jarak dalam km
}

function addToLaporan() {
    const nama = document.getElementById("nama").value;
    const nisn = document.getElementById("nisn").value;
    const kelasJurusan = document.getElementById("kelasJurusan").value;
    const tanggal = document.getElementById("tanggal").value;
    const jam = document.getElementById("jam").value;
    const finalStatus = document.getElementById("finalStatus").value;

    // Menyimpan data presensi
    const laporanBody = document.getElementById("laporan").getElementsByTagName("tbody")[0];
    const newRow = laporanBody.insertRow();
    newRow.innerHTML = `
        <td>${nama}</td>
        <td>${nisn}</td>
        <td>${kelasJurusan}</td>
        <td>${tanggal}</td>
        <td>${jam}</td>
        <td>${finalStatus}</td>
    `;

    // Menampilkan pesan sukses
    document.getElementById("message").textContent = "Presensi berhasil!";
    document.getElementById("message").style.color = "green";
}


// Get DOM elements
const navIcon = document.querySelector('.nav-icon');
const navigationMenu = document.querySelector('.header-navigation ul');

// Toggle menu visibility when nav icon is clicked
navIcon.addEventListener('click', () => {
  // Toggle menu visibility
  if (navigationMenu.style.display === 'flex') {
    // Menu is visible, hide it with animation
    navigationMenu.style.opacity = '0';
    navigationMenu.style.transform = 'translateY(-20px)';
    setTimeout(() => {
      navigationMenu.style.display = 'none';
    }, 300);
  } else {
    // Menu is hidden, show it with animation
    navigationMenu.style.display = 'flex';
    navigationMenu.style.flexDirection = 'column';
    navigationMenu.style.position = 'absolute';
    navigationMenu.style.top = '100%';
    navigationMenu.style.left = '0';
    navigationMenu.style.right = '0';
    navigationMenu.style.backgroundColor = 'rgba(0, 0, 0, 0.9)';
    navigationMenu.style.padding = '20px';
    navigationMenu.style.opacity = '0';
    navigationMenu.style.transform = 'translateY(-20px)';
    navigationMenu.style.transition = 'all 0.3s ease';
    
    // Trigger animation
    setTimeout(() => {
      navigationMenu.style.opacity = '1';
      navigationMenu.style.transform = 'translateY(0)';
    }, 10);
  }
});

// Close menu when clicking outside
document.addEventListener('click', (event) => {
  const isClickInsideMenu = navigationMenu.contains(event.target);
  const isClickOnNavIcon = navIcon.contains(event.target);
  
  if (!isClickInsideMenu && !isClickOnNavIcon && navigationMenu.style.display === 'flex') {
    navigationMenu.style.opacity = '0';
    navigationMenu.style.transform = 'translateY(-20px)';
    setTimeout(() => {
      navigationMenu.style.display = 'none';
    }, 300);
  }
});

// Close menu when window is resized above mobile breakpoint
window.addEventListener('resize', () => {
  if (window.innerWidth > 800) {  // 50em = 800px
    navigationMenu.style = '';  // Reset all inline styles
  }
});

// Add click handlers to menu items to close menu when clicked
const menuItems = navigationMenu.querySelectorAll('a');
menuItems.forEach(item => {
  item.addEventListener('click', () => {
    if (window.innerWidth <= 800) {  // Only on mobile
      navigationMenu.style.opacity = '0';
      navigationMenu.style.transform = 'translateY(-20px)';
      setTimeout(() => {
        navigationMenu.style.display = 'none';
      }, 300);
    }
  });
});

