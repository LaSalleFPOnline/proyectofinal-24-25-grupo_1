import { Component, OnInit } from '@angular/core';
import { EmpresaService } from '../services/empresa.service';

@Component({
  selector: 'app-perfil-admin',
  templateUrl: './perfil-admin.component.html',
  styleUrls: ['./perfil-admin.component.css']
})
export class PerfilAdminComponent implements OnInit {
  empresas: any[] = []; // Array para almacenar los datos de la empresa

  constructor(private empresaService: EmpresaService) { }

  ngOnInit(): void {
    this.loadEmpresas();
  
  }

  loadEmpresas(): void {
    this.empresaService.getEmpresas().subscribe(
      data => {
        this.empresas = data; // Asigna los datos recibidos al array
        },
      error => {
        console.error('Error al cargar empresas:', error);
      }
    );
  }
}
