const fs = require('fs');

async function upload() {
  const privateKey = 'private_RFlZAZ8wX/wZUswMxT4igGt9Wj8=';
  const filePath = 'C:\\Users\\Zubair\\.gemini\\antigravity-ide\\brain\\57686cef-aa50-49cc-9048-c48f946c8e30\\test_hero_banner_1789388067939.jpg';
  const fileData = fs.readFileSync(filePath);
  const base64Data = fileData.toString('base64');
  
  const form = new FormData();
  form.append('file', base64Data);
  form.append('fileName', 'test_hero_banner.jpg');
  form.append('folder', '/banners');

  const encodedAuth = Buffer.from(privateKey + ':').toString('base64');

  const res = await fetch('https://upload.imagekit.io/api/v1/files/upload', {
    method: 'POST',
    headers: {
      'Authorization': 'Basic ' + encodedAuth
    },
    body: form
  });

  const json = await res.json();
  console.log(JSON.stringify(json));
}

upload().catch(console.error);
