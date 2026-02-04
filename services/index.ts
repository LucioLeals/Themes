export const vendedoresService = {
  getFilialEstadoOptions: async () => {
    return {
      filiais: ['São Paulo', 'Rio de Janeiro', 'Belo Horizonte', 'Curitiba', 'Porto Alegre'],
      estados: ['SP', 'RJ', 'MG', 'PR', 'RS', 'SC', 'BA', 'PE', 'CE'],
    };
  },

  getVendedoresAtivos: async (filial?: string, estado?: string) => {
    const vendedores = [
      { nomecompleto: 'João Silva', email: 'joao.silva@empresa.com', filial: 'São Paulo', estado: 'SP' },
      { nomecompleto: 'Maria Santos', email: 'maria.santos@empresa.com', filial: 'Rio de Janeiro', estado: 'RJ' },
      { nomecompleto: 'Pedro Costa', email: 'pedro.costa@empresa.com', filial: 'São Paulo', estado: 'SP' },
      { nomecompleto: 'Ana Oliveira', email: 'ana.oliveira@empresa.com', filial: 'Belo Horizonte', estado: 'MG' },
      { nomecompleto: 'Carlos Souza', email: 'carlos.souza@empresa.com', filial: 'Curitiba', estado: 'PR' },
      { nomecompleto: 'Juliana Lima', email: 'juliana.lima@empresa.com', filial: 'Porto Alegre', estado: 'RS' },
      { nomecompleto: 'Roberto Alves', email: 'roberto.alves@empresa.com', filial: 'São Paulo', estado: 'SP' },
      { nomecompleto: 'Fernanda Rocha', email: 'fernanda.rocha@empresa.com', filial: 'Rio de Janeiro', estado: 'RJ' },
    ];

    let filtered = vendedores;
    if (filial) {
      filtered = filtered.filter(v => v.filial === filial);
    }
    if (estado) {
      filtered = filtered.filter(v => v.estado === estado);
    }

    return filtered;
  },
};
