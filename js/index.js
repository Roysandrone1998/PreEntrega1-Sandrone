class BaseDeDatos {
  constructor() {
    //  base de datos
    this.productos = [];
    // Vamos a cargar todos los productos que tengamos
    // Productos
    this.agregarRegistro(1, "Trucks Lab", 5000, "trucks", "truck.jfif");
    this.agregarRegistro(2, "Ruedas", 3200, "ruedas", "rueda.jfif");
    this.agregarRegistro(3, "Rulemanes", 4500, "rulemanes", "rulemanes.jfif");
    this.agregarRegistro(4, "Trucks Sk8", 5500, "trucks", "truck2.jfif")
    this.agregarRegistro(5, "Ruedas Wodoo", 2200, "ruedas", "rueda2.jfif");
  }
//registro de productos
  agregarRegistro(id, nombre, precio, categoria, imagen) {
    const producto = new Producto(id, nombre, precio, categoria, imagen);
    this.productos.push(producto);
  }

  traerRegistros() {
    return this.productos;
  }
  registroPorId(id) {
    return this.productos.find((producto) => producto.id === id);
  }

  // Retorna una lista con los productos
  registrosPorNombre(palabra) {
    return this.productos.filter((producto) => producto.nombre.toLowerCase().includes(palabra));
  }
}

// Clase carrito
class Carrito {
  constructor() {
    // Cargamos del storage
    const carritoStorage = JSON.parse(localStorage.getItem("carrito"));
    // Inicializamos variables
    this.carrito = carritoStorage || [];
    this.total = 0;
    this.totalProductos = 0;

    this.listar();
  }

  // Verificamos si el producto está en el carrito
  estaEnCarrito({ id }) {
    return this.carrito.find((producto) => producto.id === id);
  }

  // agregar el producto al carrito
  agregar(producto) {
    // lo guardo 
    const productoEnCarrito = this.estaEnCarrito(producto);
    if (productoEnCarrito) {
      //  sumo la cantidad
      productoEnCarrito.cantidad++;
    } else {
      // Si no está, lo agrego al carrito
      this.carrito.push({ ...producto, cantidad: 1 });
      localStorage.setItem("carrito", JSON.stringify(this.carrito));
    }
    // Actualizo el carrito en el HTML
    this.listar();
  }

  // quitar productos del carrito
  quitar(id) {

    const indice = this.carrito.findIndex((producto) => producto.id === id);
    // Si la cantidad del producto es mayor a 1, le resto
    if (this.carrito[indice].cantidad > 1) {
      this.carrito[indice].cantidad--;
    } else {
      // Si la cantidad es 1, lo borramos del carrito
      this.carrito.splice(indice, 1);
    }
    // Actualiza el storage
    localStorage.setItem("carrito", JSON.stringify(this.carrito));
    // Actualiza el carrito en el HTML
    this.listar();
  }

  // Actualizar el HTML de nuestro carrito
  listar() {
    // Reiniciamos las variables
    this.total = 0;
    this.totalProductos = 0;
    const divCarrito = document.querySelector("#carrito");
    // Recorremos todos los productos del carrito 
    divCarrito.innerHTML = "";
    for (const producto of this.carrito) {
      divCarrito.innerHTML += `
      <div class="card" > 
      <img src="img/${producto.imagen}" class="card-img-top" alt="trucks">
      <div class="card-body">
          <h5 class="card-title">${producto.nombre}.</h5>
          <p class="card-text">$${producto.precio}</p>
          <p><a href="#" class="btnQuitar" data-id="${producto.id}">Quitar</a></p>
        </div>
      `;
      // Actualizamos los totales
      this.total += producto.precio * producto.cantidad;
      this.totalProductos += producto.cantidad;
    }
    // Botones de quitar
    const botonesQuitar = document.querySelectorAll(".btnQuitar");
    for (const boton of botonesQuitar) {
      boton.addEventListener("click", (event) => {
        event.preventDefault();
        this.quitar(Number(boton.dataset.id));
      });
    }
    // Actualizamos variables carrito
    const spanCantidadProductos = document.querySelector("#cantidadProductos");
    const spanTotalCarrito = document.querySelector("#totalCarrito");
    spanCantidadProductos.innerText = this.totalProductos;
    spanTotalCarrito.innerText = this.total;
  }
}

// Clase "molde" para los productos
class Producto {
  constructor(id, nombre, precio, categoria, imagen = false) {
    this.id = id;
    this.nombre = nombre;
    this.precio = precio;
    this.categoria = categoria;
    this.imagen = imagen;
  }
}

// Objeto de la base de datos
const bd = new BaseDeDatos();

// Elementos
const divProductos = document.querySelector("#productos");
const formBuscar = document.querySelector("#formBuscar");
const inputBuscar = document.querySelector("#inputBuscar");
const botonCarrito = document.querySelector("section h1");

// Muestra los registros de la base de datos en nuestro HTML
function cargarProductos(productos) {
  divProductos.innerHTML = "";
  for (const producto of productos) {
    divProductos.innerHTML += `
    <div class="card" > 
    <img src="img/${producto.imagen}" class="card-img-top" alt="trucks">
    <div class="card-body">
        <h5 class="card-title">${producto.nombre}.</h5>
        <p class="card-text">$${producto.precio}</p>
        <p><a href="#" class="btnAgregar" data-id="${producto.id}">Agregar</a></p>
      </div>
    `;
  }
  // Botones de agregar al carrito
  
  const botonesAgregar = document.querySelectorAll(".btnAgregar");
  for (const boton of botonesAgregar) {
    // Le agregamos un evento click a cada uno
    boton.addEventListener("click", (event) => {
      event.preventDefault();
      // Obtenemos el ID del producto del atributo data-id
      const id = Number(boton.dataset.id);
      // Con ese ID, consultamos a nuestra base de datos por el producto
      const producto = bd.registroPorId(id);
      // Agregamos el registro (producto) a nuestro carrito
      carrito.agregar(producto);
    });
  }
}

// Evento buscador
formBuscar.addEventListener("submit", (event) => {
  event.preventDefault();
  const palabra = inputBuscar.value;
  cargarProductos(bd.registrosPorNombre(palabra.toLowerCase()));
});
// Buscador: al soltar una tecla se ejecuta el evento keyup
inputBuscar.addEventListener("keyup", (event) => {
  event.preventDefault();
  // Obtenemos el atributo value del input
  const palabra = inputBuscar.value;
  cargarProductos(bd.registrosPorNombre(palabra.toLowerCase()));
  // Pedimos a nuestra base de datos que nos traiga todos los registros
  // que coincidan con la palabra que pusimos en nuestro input
  const productos = bd.registrosPorNombre(palabra.toLowerCase());
  // Lo mostramos en el HTML
  cargarProductos(productos);
});

// Trigger para ocultar/mostrar el carrito
botonCarrito.addEventListener("click", (event) => {
  document.querySelector("section").classList.toggle("ocultar");
});

// Objeto carrito
// Objeto carrito: lo instanciamos a lo último de nuestro archivo JavaScript
// para asegurarnos que TODO esté declarado e inicializado antes de crear el carrito
const carrito = new Carrito();