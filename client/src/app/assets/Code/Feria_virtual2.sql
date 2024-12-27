INSERT INTO usuario (email, password, entidad, rol) VALUES
('admin1@example.com', '123', 'Entidad Admin 1', 1),
('admin2@example.com', '123', 'Entidad Admin 2', 1),
('admin3@example.com', '123', 'Entidad Admin 3', 1),
('admin4@example.com', '123', 'Entidad Admin 4', 1),
('admin5@example.com', '123', 'Entidad Admin 5', 1),
('empresa1@example.com', '123', 'Entidad Empresa 1', 2),
('empresa2@example.com', '123', 'Entidad Empresa 2', 2),
('empresa3@example.com', '123', 'Entidad Empresa 3', 2),
('empresa4@example.com', '123', 'Entidad Empresa 4', 2),
('empresa5@example.com', '123', 'Entidad Empresa 5', 2),
('visitante1@example.com', '123', 'Entidad Visitante 1', 3),
('visitante2@example.com', '123', 'Entidad Visitante 2', 3),
('visitante3@example.com', '123', 'Entidad Visitante 3', 3),
('visitante4@example.com', '123', 'Entidad Visitante 4', 3),
('visitante5@example.com', '123', 'Entidad Visitante 5', 3);
INSERT INTO empresa (id_usuario, nombre_empresa, web, spot, logo, descripcion, url_meet, horario_meet_morning_start, horario_meet_morning_end, horario_meet_afternoon_start, horario_meet_afternoon_end) VALUES
(6, 'Empresa 1', 'https://empresa1.com', 'https://spot1.com', 'https://logo1.com/logo.png', 'Descripción de Empresa 1', 'https://meet1.com', '09:00:00', '11:00:00', '15:00:00', '17:00:00'),
(7, 'Empresa 2', 'https://empresa2.com', 'https://spot2.com', 'https://logo2.com/logo.png', 'Descripción de Empresa 2', 'https://meet2.com', '10:00:00', '12:00:00', '16:00:00', '18:00:00'),
(8, 'Empresa 3', 'https://empresa3.com', 'https://spot3.com', 'https://logo3.com/logo.png', 'Descripción de Empresa 3', 'https://meet3.com', '09:30:00', '11:30:00', '15:30:00', '17:30:00'),
(9, 'Empresa 4', 'https://empresa4.com', 'https://spot4.com', 'https://logo4.com/logo.png', 'Descripción de Empresa 4', 'https://meet4.com', '10:30:00', '12:30:00', '16:30:00', '18:30:00'),
(10, 'Empresa 5', 'https://empresa5.com', 'https://spot5.com', 'https://logo5.com/logo.png', 'Descripción de Empresa 5', 'https://meet5.com', '08:00:00', '10:00:00', '14:00:00', '16:00:00');
INSERT INTO visitante (id_usuario) VALUES
(11), (12), (13), (14), (15);
INSERT INTO administrador (id_usuario) VALUES
(1), (2), (3), (4), (5);
INSERT INTO agenda (horaI, horaF, descripcion, detalles) VALUES
('09:00:00', '10:00:00', 'Reunión inicial', 'Detalles de la reunión inicial'),
('10:30:00', '11:30:00', 'Taller de equipo', 'Detalles del taller'),
('12:00:00', '13:00:00', 'Revisión de avances', 'Detalles de la revisión'),
('14:00:00', '15:00:00', 'Mesa redonda', 'Detalles de la mesa redonda'),
('16:00:00', '17:00:00', 'Conclusiones', 'Detalles de las conclusiones');
INSERT INTO votacion (id_usuarioVotante, id_empresaVotada, voto) VALUES
(11, 6, 1),
(12, 7, 1),
(13, 8, 0),
(14, 9, 1),
(15, 10, 0);
INSERT INTO evento (fechaVotacion_inicio, fechaVotacion_fin, fechaMostrarGanador_inicio, fechaEvento_inicio, fechaEvento_fin, fechaEdicionInfoEmpresa_inicio, fechaEdicionInfoEmpresa_fin) VALUES
('2024-12-01 08:00:00', '2024-12-02 20:00:00', '2024-12-03 08:00:00', '2024-12-05 08:00:00', '2024-12-05 18:00:00', '2024-11-20 08:00:00', '2024-11-30 18:00:00');
INSERT INTO direcciones (descripción, url) VALUES
('Dirección 1', 'https://direccion1.com'),
('Dirección 2', 'https://direccion2.com'),
('Dirección 3', 'https://direccion3.com'),
('Dirección 4', 'https://direccion4.com'),
('Dirección 5', 'https://direccion5.com');



Aquí tienes las sentencias SQL con los nombres de las tablas y columnas en minúsculas:

1. Tabla usuario
sql
Copiar código
CREATE TABLE usuario (
    id_usuario INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL,
    password VARCHAR(255) NOT NULL,
    entidad VARCHAR(255),
    rol INT NOT NULL
);
2. Tabla administrador
sql
Copiar código
CREATE TABLE administrador (
    id_administrador INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT NOT NULL,
    FOREIGN KEY (usuario_id) REFERENCES usuario(id_usuario)
);
3. Tabla empresa
sql
Copiar código
CREATE TABLE empresa (
    id_empresa INT AUTO_INCREMENT PRIMARY KEY,
    id_usuario INT NOT NULL,
    nombre_empresa VARCHAR(255),
    web VARCHAR(255),
    spot VARCHAR(255),
    logo VARCHAR(255),
    descripcion TEXT,
    url_meet VARCHAR(255),
    horario_meet_morning_start TIME,
    horario_meet_morning_end TIME,
    horario_meet_afternoon_start TIME,
    horario_meet_afternoon_end TIME,
    FOREIGN KEY (id_usuario) REFERENCES usuario(id_usuario)
);
4. Tabla evento
sql
Copiar código
CREATE TABLE evento (
    id_evento INT AUTO_INCREMENT PRIMARY KEY,
    fecha_votacion_inicio DATETIME,
    fecha_votacion_fin DATETIME,
    fecha_mostrar_ganador_inicio DATETIME,
    fecha_evento_inicio DATETIME,
    fecha_evento_fin DATETIME,
    fecha_edicion_info_empresa_inicio DATETIME,
    fecha_edicion_info_empresa_fin DATETIME
);
5. Tabla votacion
sql
Copiar código
CREATE TABLE votacion (
    id_votacion INT AUTO_INCREMENT PRIMARY KEY,
    id_usuario_votante INT NOT NULL,
    id_empresa_votada INT NOT NULL,
    voto INT,
    registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_usuario_votante) REFERENCES usuario(id_usuario),
    FOREIGN KEY (id_empresa_votada) REFERENCES empresa(id_empresa)
);
6. Tabla visitante
sql
Copiar código
CREATE TABLE visitante (
    id_visitante INT AUTO_INCREMENT PRIMARY KEY,
    id_usuario INT NOT NULL,
    FOREIGN KEY (id_usuario) REFERENCES usuario(id_usuario)
);
7. Tabla direcciones
sql
Copiar código
CREATE TABLE direcciones (
    id_direcciones INT AUTO_INCREMENT PRIMARY KEY,
    descripcion TEXT,
    url VARCHAR(255)
);
8. Tabla agenda
sql
Copiar código
CREATE TABLE agenda (
    id_agenda INT AUTO_INCREMENT PRIMARY KEY,
    hora TIME,
    horaf TIME,
    descripcion TEXT,
    detalles TEXT
);
9. Tabla relacion_comercial
sql
Copiar código
CREATE TABLE relacion_comercial (
    id_relacion_comercial INT AUTO_INCREMENT PRIMARY KEY,
    id_empresa_compradora INT NOT NULL,
    id_empresa_vendedora INT NOT NULL,
    fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_empresa_compradora) REFERENCES empresa(id_empresa),
    FOREIGN KEY (id_empresa_vendedora) REFERENCES empresa(id_empresa)
);
¿Hay algo más que te gustaría ajustar o añadir? 😊






Tú dijiste:
vale perfecto y ahora añademe los inserts serian 5 usuarioos de cada con la contraseña 123
ChatGPT Plus
ChatGPT
Claro, a continuación te proporciono los INSERT para agregar 5 registros a cada tabla que incluye usuarios, con la contraseña como 123. Para simplificar, usaré datos ficticios y asumidos para las demás columnas:

1. Insertar en la tabla usuario
sql
Copiar código
INSERT INTO usuario (email, password, entidad, rol) VALUES 
('usuario1@example.com', '123', 'Entidad1', 1),
('usuario2@example.com', '123', 'Entidad2', 2),
('usuario3@example.com', '123', 'Entidad3', 1),
('usuario4@example.com', '123', 'Entidad4', 2),
('usuario5@example.com', '123', 'Entidad5', 1);
2. Insertar en la tabla administrador
sql
Copiar código
INSERT INTO administrador (usuario_id) VALUES 
(1),
(2),
(3),
(4),
(5);
3. Insertar en la tabla empresa
sql
Copiar código
INSERT INTO empresa (id_usuario, nombre_empresa, web, spot, logo, descripcion, url_meet, horario_meet_morning_start, horario_meet_morning_end, horario_meet_afternoon_start, horario_meet_afternoon_end) VALUES 
(1, 'Empresa1', 'http://empresa1.com', 'http://spot1.com', 'http://logo1.com', 'Descripción 1', 'http://meet1.com', '09:00:00', '12:00:00', '14:00:00', '18:00:00'),
(2, 'Empresa2', 'http://empresa2.com', 'http://spot2.com', 'http://logo2.com', 'Descripción 2', 'http://meet2.com', '09:00:00', '12:00:00', '14:00:00', '18:00:00'),
(
Continuando con los INSERT para la tabla empresa:

sql
Copiar código
(2, 'Empresa2', 'http://empresa2.com', 'http://spot2.com', 'http://logo2.com', 'Descripción 2', 'http://meet2.com', '09:00:00', '12:00:00', '14:00:00', '18:00:00'),
(3, 'Empresa3', 'http://empresa3.com', 'http://spot3.com', 'http://logo3.com', 'Descripción 3', 'http://meet3.com', '09:00:00', '12:00:00', '14:00:00', '18:00:00'),
(4, 'Empresa4', 'http://empresa4.com', 'http://spot4.com', 'http://logo4.com', 'Descripción 4', 'http://meet4.com', '09:00:00', '12:00:00', '14:00:00', '18:00:00'),
(5, 'Empresa5', 'http://empresa5.com', 'http://spot5.com', 'http://logo5.com', 'Descripción 5', 'http://meet5.com', '09:00:00', '12:00:00', '14:00:00', '18:00:00');
4. Insertar en la tabla evento
sql
Copiar código
INSERT INTO evento (fecha_votacion_inicio, fecha_votacion_fin, fecha_mostrar_ganador_inicio, fecha_evento_inicio, fecha_evento_fin, fecha_edicion_info_empresa_inicio, fecha_edicion_info_empresa_fin) VALUES 
('2024-12-01 09:00:00', '2024-12-02 18:00:00', '2024-12-02 20:00:00', '2024-12-03 09:00:00', '2024-12-03 18:00:00', '2024-11-20 09:00:00', '2024-11-25 18:00:00'),
('2024-12-05 09:00:00', '2024-12-06 18:00:00', '2024-12-06 20:00:00', '2024-12-07 09:00:00', '2024-12-07 18:00:00', '2024-11-21 09:00:00', '2024-11-26 18:00:00'),
('2024-12-10 09:00:00', '2024-12-11 18:00:00', '2024-12-11 20:00:00', '2024-12-12 09:00:00', '2024-12-12 18:00:00', '2024-11-22 09:00:00', '2024-11-27 18:00:00'),
('2024-12-15 09:00:00', '2024-12-16 18:00:00', '2024-12-16 20:00:00', '2024-12-17 09:00:00', '2024-12-17 18:00:00', '2024-11-23 09:00:00', '2024-11-28 18:00:00'),
('2024-12-20 09:00:00', '2024-12-21 18:00:00', '2024-12-21 20:00:00', '2024-12-22 09:00:00', '2024-12-22 18:00:00', '2024-11-24 09:00:00', '2024-11-29 18:00:00');
5. Insertar en la tabla votacion
sql
Copiar código
INSERT INTO votacion (id_usuario_votante, id_empresa_votada, voto) VALUES 
(1, 2, 1),
(2, 3, 1),
(3, 4, 0),
(4, 5, 1),
(5, 1, 0);
6. Insertar en la tabla visitante
sql
Copiar código
INSERT INTO visitante (id_usuario) VALUES 
(1),
(2),
(3),
(4),
(5);
7. Insertar en la tabla direcciones
sql
Copiar código
INSERT INTO direcciones (descripcion, url) VALUES 
('Dirección 1', 'http://direccion1.com'),
('Dirección 2', 'http://direccion2.com'),
('Dirección 3', 'http://direccion3.com'),
('Dirección 4', 'http://direccion4.com'),
('Dirección 5', 'http://direccion5.com');
8. Insertar en la tabla agenda
sql
Copiar código
INSERT INTO agenda (hora, horaf, descripcion, detalles) VALUES 
('09:00:00', '10:00:00', 'Descripción 1', 'Detalles 1'),
('10:00:00', '11:00:00', 'Descripción 2', 'Detalles 2'),
('11:00:00', '12:00:00', 'Descripción 3', 'Detalles 3'),
('12:00:00', '13:00:00', 'Descripción 4', 'Detalles 4'),
('13:00:00', '14:00:00', 'Descripción 5', 'Detalles 5');
9. Insertar en la tabla relacion_comercial
sql
Copiar código
INSERT INTO relacion_comercial (id_empresa_compradora, id_empresa_vendedora, fecha) VALUES 
(1, 2, NOW()),
(2, 3, NOW()),
(3, 4, NOW()),
(4, 5, NOW()),
(5, 1, NOW());