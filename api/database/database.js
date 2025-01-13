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
                (1, '2025-01-28 01:00:00', '2025-01-30 15:00:00', '2025-01-31 01:00:00',
                '2025-01-30 01:00:00', '2025-01-30 23:59:59', '2025-01-14 00:00:00', '2025-01-23 22:59:59');`,

                `INSERT IGNORE INTO usuario (id_usuario, email, password, entidad, rol) VALUES
                (1, 'implaser@email.com', '$2b$10$rr6nxpEJkvlAY1xe/pbISedPshVKwe4GMhL33seGksYl/8H7h7.3K', 'La Salle Montemolín', 1),
                (2, 'altus@email.com', '$2b$10$rr6nxpEJkvlAY1xe/pbISedPshVKwe4GMhL33seGksYl/8H7h7.3K', 'La Salle Santo Ángel', 1),
                (3, 'hiberus@email.com', '$2b$10$rr6nxpEJkvlAY1xe/pbISedPshVKwe4GMhL33seGksYl/8H7h7.3K', 'La Salle Barceloneta', 1),
                (4, 'numericco@email.com', '$2b$10$rr6nxpEJkvlAY1xe/pbISedPshVKwe4GMhL33seGksYl/8H7h7.3K', 'La Salle Congress', 1),
                (5, 'almerink@gmail.com', '', 'ALMERINK SLS', 1),
                (6, 'ariadna.guardado@manlleu.lasalle.cat', '', 'Ecocruise', 1),
                (7, 'chaima.mohamed@manlleu.lasalle.cat', '', 'GOAUTO!', 1),
                (8, 'cleanplus2cfa@gmail.com', '', 'CleanPlus', 1),
                (9, 'drivexpert145@gmail.com', '', 'DRIVEXPERT', 1),
                (10, 'elitestates2024@gmail.com', '', 'Elite Estates, S.L.', 1),
                (11, 'empresasimulada1@lasallesagradocorazon.es', '', 'Blue Technology SL', 1),
                (12, 'empresasimulada2@lasallesagradocorazon.es', '', 'Elitecars SL', 1),
                (13, 'empresasimulada3@lasallesagradocorazon.es', '', 'AROMA SL', 1),
                (14, 'epiworks.sefed@lasalleinstitucion.es', '', 'EPIWORKS LA SALLE S.L.S.', 1),
                (15, 'fusteslasalle.sefed@lasalle.cat', '', 'Fustes La Salle', 1),
                (16, 'gising.2425@gmail.com', '', 'GISING, SLS', 1),
                (17, 'infininitevitality@gmail.com', '', 'INFINITE VITALITY', 1),
                (18, 'info.sallematsuministros@gmail.com', '', 'SALLEMAT SUMINISTROS S.L.', 1),
                (19, 'innovavest@gmail.com', '', 'InnovaVest', 1),
                (20, 'JARDINDEARTEMISA24@GMAIL.COM', '', 'JARDÍN DE ARTEMISA S.L', 1),
                (21, 'josemitechsll@gmail.com', '', 'JosemiTech, S.L.L.', 1),
                (22, 'manuelatejeropaez@lasallemundonuevo.es', '', 'Ofimueble', 1),
                (23, 'mohamedamin.boutammant@manlleu.lasalle.cat', '', 'NeoTech', 1),
                (24, 'nour.bangarda@manlleu.lasalle.cat', '', 'Vêtements d occasion SLS', 1),
                (25, 'sallelanbiltegiak.sefed@lsbikasleak.eus', '', 'SALLE-LAN BILTEGIAK S.L.S', 1),
                (26, 'sallelleidanexa@gmail.com', '', 'NEXA', 1),
                (27, 'sara.jimenez@manlleu.lasalle.cat', '', 'eventura', 1),
                (28, 'techcitymollerussa@gmail.com', '', 'TECH CITY', 1),
                (29, 'tecno.market.official1@gmail.com', '', 'TECNO-MARKET', 1),
                (30, 'tecnusventas@lasallesagradocorazon.es', '', 'TECNUS SAS', 1),
                (31, 'uniclip5jerez@gmail.com', '', 'UniClip', 1),
                (32, 'velocitycar.sefed@gmail.com', '', 'VelocityCar SLS', 1),
                (33, 'vending.sefed@lasalleinstitucion.es', '', 'VENDING LA SALLE, S.L.S.', 1),
                (34, 'comercialdecoevents@gmail.com', '', 'Decoevents', 1),
                (35, 'comercialwiflex@gmail.com', '', 'WIFLEX', 1),
                (36, 'comerciallinemarketing@gmail.com', '', 'LINEMARKETING', 1),
                (37, 'comercialsegurity360@gmail.com', '', 'Security 360 S.L', 1),
                (38, 'irmama@lsbikasleak.eus', '', 'SALLE-LAN BILTEGIAK, S.L.S.', 2),
                (39, 'juoroi@lsbikasleak.eus', '', 'SALLE-LAN BILTEGIAK S.L.S', 2),
                (40, 'ana@lasallemundonuevo.es', '', 'La Salle Sagrado Corazón de Jesús', 2),
                (41, 'miguel@lasallemundonuevo.es', '', 'La Salle Sagrado Corazón de Jesús', 2),
                (42, 'iabehrens@lasallesagradocorazon.es', '', 'LA SALLE SAGRADO CORAZÓN', 2),
                (43, 'diana.ortiz@lasallecorrales.es', '', 'Sallemat Suministros S.L.', 2),
                (44, 'info.sallematsuministros@gmail.com', '', 'Sallemat Suministros S.L.', 2),
                (45, 'francinatortella@lasallevp.es', '', 'CC LA SALLE INCA', 2),
                (46, 'magimenez@lasalle.cat', '', 'La Salle Premià', 2),
                (47, 'aalcinaa@lasallecadiz.es', '', 'LA SALLE VIÑA', 2),
                (48, 'gpurti@lasalle.es', '', 'LA SALLE FP ONLINE', 2),
                (49, 'ralegret@lasalle.es', '', 'LA SALLE FP ONLINE', 2),
                (50, 'denciso@lasallesanasensio.es', '', 'La Salle - La Estrella (1GB)', 2),
                (51, 'jdiaz@lasallesanasensio.es', '', 'La Salle - La Estrella (2ºGB)', 2),
                (52, 'esaenz@lasallesanasensio.es', '', 'La Salle - La Estrella (1GM)', 2),
                (53, 'accasado@lasallesanasensio.es', '', 'La Salle La Estrella (2ºGM)', 2),
                (54, 'jccarrera@lasalle.cat', '', 'La Salle Barceloneta', 2),
                (55, 'laura@email.com', '', 'LA SALLE FP ONLINE', 3),
                (56, 'silvia@email.com', '', 'LA SALLE FP ONLINE', 3),
                (57, 'santi@email.com', '', 'LA SALLE FP ONLINE', 3),
                (58, 'marta@email.com', '', 'LA SALLE FP ONLINE', 3),
                (59, 'jordi@email.com', '', 'LA SALLE FP ONLINE', 3),
                (60, 'empresa@email.com', '', 'LA SALLE FP ONLINE', 1),
                (61, 'visitante@email.com', '', 'LA SALLE FP ONLINE', 2),
                (62, 'mbella@email.com', '', 'LA SALLE FP ONLINE', 1),
                (63, 'mb@email.com', '', 'LA SALLE FP ONLINE', 2);`,

              `INSERT IGNORE INTO empresa (id_empresa, id_usuario, nombre_empresa, web, spot, logo, descripcion, url_meet,
                horario_meet_morning_start, horario_meet_morning_end, horario_meet_afternoon_start, horario_meet_afternoon_end)
                VALUES
                (1, 1, 'Implaser', 'https://www.implaser.com/', '', 'logos/1736013385716.jpg', 'Implaser es una empresa líder en señalización y soluciones gráficas, especializada en la fabricación de señalización de seguridad, evacuación y accesibilidad. Con sede en Zaragoza, España, se destaca por su innovación y compromiso con la calidad, ofreciendo productos certificados y personalizados que cumplen con las normativas más exigentes. Implaser también apuesta por la sostenibilidad, utilizando materiales ecológicos y procesos de producción respetuosos con el medio ambiente.', 'https://meet.google.com/spu-czhw-tjt', '10:00:00', '11:00:00','17:00:00','17:30:00'),
                (2, 2, 'Altus', 'https://wearealtus.com/es/', '', 'logos/1736013536558.jpg', 'Altus es una empresa española fundada en 1945, especializada en el diseño, fabricación y desarrollo de ropa y equipamiento técnico para actividades outdoor. Su enfoque combina innovación, sostenibilidad y respeto por la naturaleza, creando productos de alta calidad para montañismo, trekking, senderismo y más. Altus es reconocida por su compromiso con el medio ambiente y su apuesta por la tecnología en materiales avanzados​.', 'https://meet.google.com/iym-eopc-ech', '08:00:00', '09:00:00','16:00:00','17:00:00'),
                (3, 3, 'Hiberus', 'https://www.hiberus.com/', 'https://www.youtube.com/watch?v=tSyh6afY_kU', 'logos/1736013769677.jpg', 'Hiberus es una destacada empresa española de consultoría tecnológica y desarrollo digital. Ofrecen servicios especializados en transformación digital, outsourcing, y soluciones innovadoras en áreas como inteligencia de datos, eficiencia empresarial y experiencia del cliente. Con más de 3,200 empleados y presencia en 19 países, trabajan con clientes públicos y privados, impulsando su crecimiento mediante tecnología y estrategias de negocio personalizadas.', 'https://meet.google.com/eni-vecv-czx', '12:00:00', '13:00:00', '15:30:00', '16:00:00'),
                (4, 4, 'Numericco', 'https://www.numericco.com/', 'https://www.youtube.com/watch?v=uYVkAlQft9w', 'logos/1736106814114.jpg', 'Numericco es una boutique digital especializada en diseño, tecnología y estrategias de marketing, con más de 10 años de experiencia. Su enfoque combina diseño gráfico, ingeniería informática y tecnologías innovadoras para crear soluciones digitales personalizadas, impulsando marcas y proyectos de comercio electrónico. Han ganado múltiples premios nacionales y se destacan como expertos en plataformas como Shopify y PrestaShop, posicionándose como líderes en su sector​.', 'https://meet.google.com/xxb-jjdk-wgw', '10:00:00', '11:00:00', '17:00:00', '17:30:00');`,

              `INSERT IGNORE INTO votacion (id_votacion, id_usuarioVotante, id_empresaVotada, voto) VALUES
                (1, 1, 3, 1),
                (2, 2, 3, 1);`,

              `INSERT IGNORE INTO agenda (id_agenda, horaI, horaF, descripcion, detalles) VALUES
                (1, '09:00:00', '09:15:00', 'Acto Inaugural', 'Enlace a meet: https://meet.google.com/jfs-cwuq-znf'),
                (2, '09:15:00', '10:00:00', 'Conferencia: Emprender con Lluís Valls', 'Enlace a meet: https://meet.google.com/jfs-cwuq-znf'),
                (3, '10:00:00', '13:00:00', 'Feria Virtual', 'Sesión de mañana.'),
                (4, '13:00:00', '15:30:00', 'Descanso', 'Hacemos un descanso para comer y volver con fuerzas'),
                (5, '15:30:00', '18:30:00', 'Feria Virtual', 'Sesión de tarde.'),
                (6, '18:30:00', '19:00:00', 'Clausura de la Feria', 'Anuncio de la empresa ganadora del concurso de spots. Enlace meet: https://meet.google.com/jfs-cwuq-znf');`,

              `INSERT IGNORE INTO relacion_comercial (id_relacionComercial, id_empresaCompradora, id_empresaVendedora) VALUES
                (1, 1, 2),
                (2, 1, 3),
                (3, 1, 4),
                (4, 2, 1),
                (5, 4, 1);`
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
