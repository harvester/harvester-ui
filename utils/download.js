import JSZip from 'jszip';

export async function downloadFile(fileName, content, contentType = 'text/plain;charset=utf-8') {
  const blob = new Blob([content], { type: contentType });
  const { saveAs } = await import('file-saver');

  return saveAs(blob, fileName);
}

// {[fileName1]:data1, [fileName2]:data2}
export function generateZip(files) {
  // Moving this to a dynamic const JSZip = import('jszip') didn't work... figure out later
  const zip = new JSZip();

  for ( const fileName in files) {
    if (files[fileName]?.data) {
      zip.file(fileName, files[fileName].data);
    }
  }

  return zip.generateAsync({ type: 'blob' });
}
