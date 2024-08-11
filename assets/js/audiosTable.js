/*
    Desenvolvido por João Castro
    gihub: https://github.com/joaoVitorLeal
	Linkedin: https://www.linkedin.com/in/joaovlc/
    Uso comercial sujeito a pagamento e licenciamento.
    Entre em contato para mais informações sobre licenciamento e preços.
    Data: Agosto 2024
*/


// Funções auxiliares:
// Função scroll suave;
function smoothScrollTo(element, position) {
    element.scrollIntoView({ behavior: 'smooth', block: position });
}

// Tratamento de erros para Downloads:
// Função para verificar a existência de arquivos (downloads);
async function fileExists(url) {
    try {
        const response = await fetch(url, { method: 'HEAD' });
        return response.ok;
    } catch (error) {
        console.error('Erro ao verificar a existência do arquivo:', error);
        return false;
    }
}

// Função para emissão de mensagem (downloads);
function showErrorDialog(message) {
    alert(message);
}

// Função para gerenciar o download do áudio (downloads);
async function handleDownload(event) {
    event.preventDefault();
    const link = this.getAttribute('href');
    console.log('Verificando existência do arquivo:', link);

    const exists = await fileExists(link);

    if (exists) {
        console.log('Arquivo encontrado. Iniciando download...');
        window.location.href = link;
    } else {
        showErrorDialog(`The audio "${this.getAttribute('download')}" is currently not available for download and will be made available soon.`);
    }
}

// Função principal: carregamento de tabelas, arquivos CSV e áudios.
document.addEventListener('DOMContentLoaded', function () {
    function loadTable(csvPath, tableId) {
        Papa.parse(csvPath, {
            download: true,
            header: true,
            complete: function (results) {
                const data = results.data;
                const tableBody = document.querySelector(`#${tableId} tbody`);

                tableBody.innerHTML = '';

                data.forEach(row => {
                    if (Object.keys(row).length && row.name_file) {
                        const tr = document.createElement('tr');

                        Object.keys(row).forEach(key => {
                            const td = document.createElement('td');
                            td.textContent = row[key] || '';
                            tr.appendChild(td);
                        });

                        const downloadTd = document.createElement('td');
                        const downloadLink = document.createElement('a');
                        downloadLink.href = `${csvPath.replace('data_recordings.csv', '')}${row.name_file}`;
                        downloadLink.download = row.name_file;
                        downloadLink.innerHTML = '<i class="fa-solid fa-download download-icon"></i>';

                        downloadLink.addEventListener('click', function(event) {
                            event.preventDefault();

                            document.querySelectorAll('.download-icon').forEach(icon => {
                                icon.classList.remove('active');
                            });

                            this.querySelector('.download-icon').classList.add('active');
                            
                        });

                        // Adiciona o tratamento de erro ao link de download
                        downloadLink.addEventListener('click', handleDownload);

                        downloadTd.appendChild(downloadLink);
                        tr.appendChild(downloadTd);

                        tableBody.appendChild(tr);
                    }
                });

                hideExcessRows(tableId);
            }
        });
    }

    function hideExcessRows(tableId) {
        const tableBody = document.querySelector(`#${tableId} tbody`);
        const rows = tableBody.querySelectorAll('tr');
        rows.forEach((row, index) => {
            if (index >= 10) {
                row.style.display = 'none';
            }
        });
    }

    window.loadMoreRows = function (tableId) {
        const tableBody = document.querySelector(`#${tableId} tbody`);
        const rows = tableBody.querySelectorAll('tr');
        let visibleRows = 0;

        rows.forEach((row) => {
            if (row.style.display !== 'none') {
                visibleRows++;
            }
        });

        const newVisibleRows = visibleRows + 20;

        rows.forEach((row, index) => {
            if (index < newVisibleRows) {
                row.style.display = '';
            }
        });

        const loadMoreButton = document.getElementById(`loadMoreButton${tableId.replace('audioTable', '')}`);
        let loadLessButton = document.getElementById(`loadLessButton${tableId.replace('audioTable', '')}`);

        if (!loadLessButton) {
            loadLessButton = document.createElement('button');
            loadLessButton.id = `loadLessButton${tableId.replace('audioTable', '')}`;
            loadLessButton.textContent = 'View Less';
            loadLessButton.classList.add('button'); // Adiciona a classe CSS;
            loadMoreButton.parentNode.insertBefore(loadLessButton, loadMoreButton.nextSibling);

            loadLessButton.style.display = 'none';
            loadLessButton.onclick = function () {
                hideExcessRows(tableId);
                smoothScrollTo(document.getElementById(tableId), 'start');
                loadLessButton.style.display = 'none';
                loadMoreButton.style.display = 'inline';
                loadMoreButton.textContent = 'View More';
            };
        }

        if (newVisibleRows >= rows.length) {
            loadMoreButton.style.display = 'none';
            loadLessButton.style.display = 'inline';
        } else {
            loadLessButton.style.display = 'inline';
        }

        // Scroll down para a última linha visível da tabela;
        const lastVisibleRow = rows[newVisibleRows - 1];
        setTimeout(() => smoothScrollTo(lastVisibleRow, 'end'), 100);
    };

    loadTable("/audios/audios_cascos/data_recordings.csv", "audioTable1");
    loadTable("/audios/audios_Teste_aparatus_database/data_recordings.csv", "audioTable2");
    loadTable("/audios/audio_tambores/data_recordings.csv", "audioTable3");
});