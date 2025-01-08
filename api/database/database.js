const mysql = require('mysql2');
const keys = require('../keys');

const connection = mysql.createConnection({
  host: keys.dbHost,
  // user: keys.dbUser,
  // password: keys.dbPassword,
  user: "root",
  password: "root",
  port: keys.dbPort
});

const initializeDatabase = (callback) => {
  connection.connect(err => {
    if (err) {
      console.error('Error conectando a la base de datos: ' + err.stack);
      return callback(err);
    }
    console.log('Conectado a la base de datos con ID ' + connection.threadId);
    connection.query('CREATE DATABASE IF NOT EXISTS Feria_virtual', (err) => {
      if (err) {
        console.error('Error al crear la base de datos: ', err);
        return callback(err);
      }
      console.log('Base de datos creada o ya existe');
      connection.changeUser({ database: 'Feria_virtual' }, (err) => {
        if (err) {
          console.error('Error al cambiar de base de datos: ', err);
          return callback(err);
        }
        console.log('Conectado a la base de datos Feria_virtual');
        const queries = [
          `CREATE TABLE IF NOT EXISTS usuario (
            id_usuario INT AUTO_INCREMENT PRIMARY KEY,
            email VARCHAR(255) NOT NULL UNIQUE,
            password VARCHAR(255) NOT NULL,
            entidad VARCHAR(500) NOT NULL,
            rol INT NOT NULL CHECK (rol IN (1, 2, 3))
          )`,
          `CREATE TABLE IF NOT EXISTS empresa (
            id_empresa INT AUTO_INCREMENT PRIMARY KEY,
            id_usuario INT,
            nombre_empresa VARCHAR(255),
            web VARCHAR(2083),
            spot VARCHAR(2083),
            logo VARCHAR(2083),
            descripcion VARCHAR(5000),
            url_meet VARCHAR(2083),
            horario_meet_morning_start TIME NULL,
            horario_meet_morning_end TIME NULL,
            horario_meet_afternoon_start TIME NULL,
            horario_meet_afternoon_end TIME NULL,
            FOREIGN KEY (id_usuario) REFERENCES usuario(id_usuario)
          )`,
          `CREATE TABLE IF NOT EXISTS visitante (
            id_visitante INT AUTO_INCREMENT PRIMARY KEY,
            id_usuario INT,
            FOREIGN KEY (id_usuario) REFERENCES usuario(id_usuario)
          )`,
          `CREATE TABLE IF NOT EXISTS administrador (
            id_administrador INT AUTO_INCREMENT PRIMARY KEY,
            id_usuario INT,
            FOREIGN KEY (id_usuario) REFERENCES usuario(id_usuario)
          )`,
          `CREATE TABLE IF NOT EXISTS agenda (
            id_agenda INT AUTO_INCREMENT PRIMARY KEY,
            horaI TIME NOT NULL,
            horaF TIME NOT NULL,
            descripcion VARCHAR(3000),
            detalles VARCHAR(3000)
          )`,
          `CREATE TABLE IF NOT EXISTS votacion (
            id_votacion INT AUTO_INCREMENT PRIMARY KEY,
            id_usuarioVotante INT NOT NULL,
            id_empresaVotada INT NOT NULL,
            voto TINYINT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (id_usuarioVotante) REFERENCES usuario(id_usuario),
            FOREIGN KEY (id_empresaVotada) REFERENCES empresa(id_empresa),
            UNIQUE (id_usuarioVotante, id_empresaVotada)
          )`,
          `CREATE TABLE IF NOT EXISTS evento (
            id_evento INT AUTO_INCREMENT PRIMARY KEY,
            fechaVotacion_inicio DATETIME NOT NULL,
            fechaVotacion_fin DATETIME NOT NULL,
            fechaMostrarGanador_inicio DATETIME NOT NULL,
            fechaEvento_inicio DATETIME NOT NULL,
            fechaEvento_fin DATETIME NOT NULL,
            fechaEdicionInfoEmpresa_inicio DATETIME NOT NULL,
            fechaEdicionInfoEmpresa_fin DATETIME NOT NULL
            )`,
            `CREATE TABLE IF NOT EXISTS direcciones (
              id_direcciones INT AUTO_INCREMENT PRIMARY KEY,
              descripcion VARCHAR(255) NOT NULL,
              url VARCHAR(2083) NOT NULL
            )`,
            `CREATE TABLE IF NOT EXISTS relacion_comercial (
              id_relacionComercial INT AUTO_INCREMENT PRIMARY KEY,
              id_empresaCompradora INT NOT NULL,
              id_empresaVendedora INT NOT NULL,
              fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
              FOREIGN KEY (id_empresaCompradora) REFERENCES empresa(id_empresa),
              FOREIGN KEY (id_empresaVendedora) REFERENCES empresa(id_empresa)
          )`
        ];

        let completedQueries = 0;
        queries.forEach((query) => {
          connection.query(query, (err) => {
            if (err) {
              console.error('Error al crear la tabla: ', err);
              return callback(err);
            }
            completedQueries += 1;
            if (completedQueries === queries.length) {
              console.log('Tablas creadas o ya existen');
              const dummyDataQueries = [
                `INSERT IGNORE INTO evento (id_evento, fechaVotacion_inicio, fechaVotacion_fin, fechaMostrarGanador_inicio,
                fechaEvento_inicio, fechaEvento_fin, fechaEdicionInfoEmpresa_inicio, fechaEdicionInfoEmpresa_fin)
                VALUES
                (1, '2025-01-10 00:00:00', '2025-01-10 22:59:59', '2025-02-1 00:00:00',
                '2025-01-10 00:00:00', '2025-01-10 22:59:59', '2025-01-08 00:00:00', '2025-01-09 22:59:59');`,
                `INSERT IGNORE INTO usuario (id_usuario, email, password, entidad, rol) VALUES
                (1, 'implaser@email.com', '$2b$10$rr6nxpEJkvlAY1xe/pbISedPshVKwe4GMhL33seGksYl/8H7h7.3K', 'La Salle Montemolín', 1),
                (2, 'metropolitan@email.com', '$2b$10$rr6nxpEJkvlAY1xe/pbISedPshVKwe4GMhL33seGksYl/8H7h7.3K', 'La Salle Lourdes', 1),
                (3, 'universitat@email.com', '$2b$10$rr6nxpEJkvlAY1xe/pbISedPshVKwe4GMhL33seGksYl/8H7h7.3K', 'La Salle Gràcia', 1),
                (4, 'altus@email.com', '$2b$10$rr6nxpEJkvlAY1xe/pbISedPshVKwe4GMhL33seGksYl/8H7h7.3K', 'La Salle Santo Ángel', 1),
                (5, 'bosch@email.com', '$2b$10$rr6nxpEJkvlAY1xe/pbISedPshVKwe4GMhL33seGksYl/8H7h7.3K', 'La Salle Bonanova', 1),
                (6, 'converzar@email.com', '$2b$10$rr6nxpEJkvlAY1xe/pbISedPshVKwe4GMhL33seGksYl/8H7h7.3K', 'La Salle Franciscanas', 1),
                (7, 'hiberus@email.com', '$2b$10$rr6nxpEJkvlAY1xe/pbISedPshVKwe4GMhL33seGksYl/8H7h7.3K', 'La Salle Barceloneta', 1),
                (8, 'numericco@email.com', '$2b$10$rr6nxpEJkvlAY1xe/pbISedPshVKwe4GMhL33seGksYl/8H7h7.3K', 'La Salle Congress', 1),
                (9, 'ale@email.com', '$2b$10$rr6nxpEJkvlAY1xe/pbISedPshVKwe4GMhL33seGksYl/8H7h7.3K', 'La Salle Gràcia', 2),
                (10, 'pili@email.com', '$2b$10$rr6nxpEJkvlAY1xe/pbISedPshVKwe4GMhL33seGksYl/8H7h7.3K', 'Otros. Consejera Educación', 3),
                (11, 'marta@email.com', '', 'La Salle Gràcia', 1),
                (12, 'jordi@email.com', '', 'La Salle Bonanova', 1),
                (13, 'laura@email.com', '', 'La Salle Congress', 1),
                (14, 'silvia@email.com', '', 'La Salle Santo Ángel', 1),
                (15, 'santi@email.com', '', 'La Salle Santo Ángel', 1),
                (16, 'roger@email.com', '', 'La Salle Gràcia', 1),
                (17, 'mario@email.com', '', 'La Salle Bonanova', 1),
                (18, 'samuel@email.com', '', 'La Salle Congress', 1),
                (19, 'laurita@email.com', '', 'La Salle Santo Ángel', 1),
                (20, 'yoshua@email.com', '', 'La Salle Santo Ángel', 1),
                (21, 'empresa1@email.com', '', 'Datos Dummy Empresa', 1),
                (22, 'empresa2@email.com', '', 'Datos Dummy Empresa', 1),
                (23, 'empresa3@email.com', '', 'Datos Dummy Empresa', 1),
                (24, 'mbella@email.com', '', 'La Salle Barceloneta', 2),
                (25, 'jcortes@email.com', '', 'La Salle Ramón Lull', 2),
                (26, 'lperez@email.com', '', 'La Salle Franciscanas', 2),
                (27, 'sduarte@email.com', '', 'La Salle Montemolín', 2),
                (28, 'sfrutos@email.com', '', 'La Salle Santo Ángel', 1),
                (29, 'rnavarro@email.com', '', 'La Salle Gràcia', 1),
                (30, 'mgarcia@email.com', '', 'La Salle Bonanova', 1),
                (31, 'smateos@email.com', '', 'La Salle Congress', 1),
                (32, 'lruiz@email.com', '', 'La Salle Santo Ángel', 1),
                (33, 'yvidal@email.com', '', 'La Salle Santo Ángel', 1),
                (34, 'visitante1@email.com', '', 'Datos Dummy Visitante', 2),
                (35, 'visitante2@email.com', '', 'Datos Dummy Visitante', 2),
                (36, 'visitante3@email.com', '', 'Datos Dummy Visitante', 2),
                (37, 'mb@email.com', '', 'La Salle Montemolín', 3),
                (38, 'jc@email.com', '', 'La Salle Montemolín', 3),
                (39, 'lp@email.com', '', 'La Salle Montemolín', 3),
                (40, 'sd@email.com', '', 'La Salle Montemolín', 3),
                (41, 'sf@email.com', '', 'La Salle Santo Ángel', 1),
                (42, 'rn@email.com', '', 'La Salle Gràcia', 1),
                (43, 'mg@email.com', '', 'La Salle Bonanova', 1),
                (44, 'sm@email.com', '', 'La Salle Congress', 1),
                (45, 'lr@email.com', '', 'La Salle Santo Ángel', 1),
                (46, 'yv@email.com', '', 'La Salle Santo Ángel', 1),
                (47, 'admin1@email.com', '', 'Datos Dummy Admin', 3),
                (48, 'admin2@email.com', '', 'Datos Dummy Admin', 3),
                (49, 'admin3@email.com', '', 'Datos Dummy Admin', 3);`,
              `INSERT IGNORE INTO empresa (id_empresa, id_usuario, nombre_empresa, web, spot, logo, descripcion, url_meet,
                horario_meet_morning_start, horario_meet_morning_end, horario_meet_afternoon_start, horario_meet_afternoon_end)
                VALUES
                (1, 1, 'Implaser', 'https://www.implaser.com/', '', 'logos/1736013385716.jpg', 'Implaser es una empresa líder en señalización y soluciones gráficas, especializada en la fabricación de señalización de seguridad, evacuación y accesibilidad. Con sede en Zaragoza, España, se destaca por su innovación y compromiso con la calidad, ofreciendo productos certificados y personalizados que cumplen con las normativas más exigentes. Implaser también apuesta por la sostenibilidad, utilizando materiales ecológicos y procesos de producción respetuosos con el medio ambiente.', 'https://meet.google.com/spu-czhw-tjt', '10:00:00', '11:00:00','17:00:00','17:30:00'),
                (2, 2, 'Gimnasio Metropolitan', 'https://clubmetropolitan.com/', '', 'logos/1736106846092.png', 'Club Metropolitan es una cadena líder de centros de fitness y bienestar en España. Ofrece una experiencia integral que combina gimnasio de alta gama, spa, y actividades dirigidas, todo en instalaciones modernas y elegantes. Con un enfoque en la salud y el bienestar, Metropolitan brinda servicios personalizados, incluyendo entrenadores personales y tratamientos de belleza. Es el destino ideal para quienes buscan mejorar su calidad de vida en un entorno exclusivo y sofisticado.', 'https://meet.google.com/bpq-yxhv-sgr', '09:00:00', '10:00:00','17:30:00','16:30:00'),
                (3, 3, 'Universitat de Barcelona', 'https://web.ub.edu/inici', '', 'logos/1736106910331.jpg', 'La Universidad de Barcelona (UB) es una de las principales instituciones académicas de España y Europa, reconocida por su excelencia en docencia, investigación e innovación. Ofrece una amplia gama de grados, másteres y doctorados en diversas áreas del conocimiento. Con más de 560 años de historia, la UB combina tradición y modernidad, promoviendo un entorno académico dinámico y multicultural, comprometido con el desarrollo científico, cultural y social.', 'https://meet.google.com/iaj-zjeu-fon', '12:00:00', '12:30:00','18:00:00','19:00:00'),
                (4, 4, 'Altus', 'https://wearealtus.com/es/', '', 'logos/1736013536558.jpg', 'Altus es una empresa española fundada en 1945, especializada en el diseño, fabricación y desarrollo de ropa y equipamiento técnico para actividades outdoor. Su enfoque combina innovación, sostenibilidad y respeto por la naturaleza, creando productos de alta calidad para montañismo, trekking, senderismo y más. Altus es reconocida por su compromiso con el medio ambiente y su apuesta por la tecnología en materiales avanzados​.', 'https://meet.google.com/iym-eopc-ech', '08:00:00', '09:00:00','16:00:00','17:00:00'),
                (5, 5, 'Bosch', 'https://www.bosch-home.es/', '', 'logos/1736107009163.png', 'Bosch Home es una marca líder en electrodomésticos que combina tecnología avanzada con un diseño elegante y funcional. Parte del Grupo Bosch, la empresa ofrece una amplia gama de productos innovadores para el hogar, desde lavadoras y frigoríficos hasta soluciones de cocina y limpieza. Con un fuerte enfoque en la eficiencia energética y la sostenibilidad, Bosch Home se compromete a mejorar la calidad de vida de sus clientes mediante productos duraderos y de alto rendimiento.', 'https://meet.google.com/xut-dzgh-duc', '10:30:00', '11:00:00','16:30:00','18:00:00'),
                (6, 6, 'Converzar', 'https://converzar.com/', 'https://youtu.be/IJkG-4cfnVg', 'logos/1736013658813.png', 'Converzar, fundada en 1975 en Zaragoza, es una empresa especializada en soluciones adhesivas y componentes técnicos para sectores como automoción, aeronáutica y electrodomésticos. Combina innovación, sostenibilidad y una fuerte tradición familiar para desarrollar productos a medida que mejoran la competitividad de sus clientes. Ha liderado proyectos en movilidad sostenible y ha crecido significativamente en los últimos años, con importantes inversiones en tecnología y expansión.', 'https://meet.google.com/uia-spcs-cvq', '10:00:00', '12:00:00', '15:00:00', '16:00:00'),
                (7, 7, 'Hiberus', 'https://www.hiberus.com/', 'https://www.youtube.com/watch?v=tSyh6afY_kU', 'logos/1736013769677.jpg', 'Hiberus es una destacada empresa española de consultoría tecnológica y desarrollo digital. Ofrecen servicios especializados en transformación digital, outsourcing, y soluciones innovadoras en áreas como inteligencia de datos, eficiencia empresarial y experiencia del cliente. Con más de 3,200 empleados y presencia en 19 países, trabajan con clientes públicos y privados, impulsando su crecimiento mediante tecnología y estrategias de negocio personalizadas.', 'https://meet.google.com/eni-vecv-czx', '12:00:00', '13:00:00', '15:30:00', '16:00:00'),
                (8, 8, 'Numericco', 'https://www.numericco.com/', 'https://www.youtube.com/watch?v=uYVkAlQft9w', 'logos/1736106814114.jpg', 'Numericco es una boutique digital especializada en diseño, tecnología y estrategias de marketing, con más de 10 años de experiencia. Su enfoque combina diseño gráfico, ingeniería informática y tecnologías innovadoras para crear soluciones digitales personalizadas, impulsando marcas y proyectos de comercio electrónico. Han ganado múltiples premios nacionales y se destacan como expertos en plataformas como Shopify y PrestaShop, posicionándose como líderes en su sector​.', 'https://meet.google.com/xxb-jjdk-wgw', '10:00:00', '11:00:00', '17:00:00', '17:30:00');`,
              `INSERT IGNORE INTO administrador (id_administrador, id_usuario) VALUES
                (1, 9);`,
              `INSERT IGNORE INTO visitante (id_visitante, id_usuario) VALUES
                (1, 10);`,
              `INSERT IGNORE INTO votacion (id_votacion, id_usuarioVotante, id_empresaVotada, voto) VALUES
                (1, 5, 6, 1),
                (2, 2, 6, 1),
                (3, 1, 7, 1);`,
              `INSERT IGNORE INTO agenda (id_agenda, horaI, horaF, descripcion, detalles) VALUES
                (1, '09:00:00', '09:15:00', 'Acto Inaugural', 'Enlace a meet: https://meet.google.com/jfs-cwuq-znf'),
                (2, '09:15:00', '10:00:00', 'Conferencia: Emprender con Lluís Valls', 'Enlace a meet: https://meet.google.com/jfs-cwuq-znf'),
                (3, '10:00:00', '12:59:59', 'Feria Virtual', 'Sesión de mañana.'),
                (4, '15:30:00', '18:29:59', 'Descanso', 'Hacemos un descanso para comer y volver con fuerzas'),
                (5, '15:30:00', '18:29:59', 'Feria Virtual', 'Sesión de tarde.'),
                (6, '18:30:00', '18:59:59', 'Clausura de la Feria', 'Anuncio de la empresa ganadora del concurso de spots. Enlace meet: https://meet.google.com/jfs-cwuq-znf'),
                (7, '19:00:00', '19:59:59', 'Para pruebas. Borrar al publicar', '¡Hora de hacer contactos!'),
                (8, '20:00:00', '21:30:00', 'Para pruebas. Borrar al publicar', 'Con un experto en emprendimiento. ¡No te lo pierdas!'),
                (9, '21:35:00', '22:29:59', 'Para pruebas. Borrar al publicar', 'Sorteos y sorpresas. ¡Atentos a los anuncios!'),
                (10, '22:30:00', '23:55:00', 'Para pruebas. Borrar al publicar', 'Disfruta de un momento de relax con buena música.');`,
              `INSERT IGNORE INTO relacion_comercial (id_relacionComercial, id_empresaCompradora, id_empresaVendedora) VALUES
                (1, 1, 2),
                (2, 1, 6),
                (3, 1, 5),
                (4, 4, 1),
                (5, 6, 1),
                (6, 5, 1);`
              ];
              let completedInserts = 0;
              dummyDataQueries.forEach((query) => {
                connection.query(query, (err) => {
                  if (err) {
                    console.error('Error al insertar datos dummy: ', err);
                    return callback(err);
                  }
                  completedInserts += 1;
                  if (completedInserts === dummyDataQueries.length) {
                    console.log('Datos dummy insertados');
                    callback(null);
                  }
                });
              });
            };
          });
        });
      });
    });
  });
};

module.exports = {
  initializeDatabase,
  connection
};

// TODO: Aquí haremos los inserts process.env.NODE_ENV !== "production"
// IF(process.env.NODE_ENV !== "production"){

// Hacemos los inserts de los datos dummy
// }
