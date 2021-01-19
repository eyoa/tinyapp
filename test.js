const generateRandomString = function(){
  const result = [];
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789abcdefghijklmnopqrstuvwxyz';
  const numChars = 6 + 1;
  for (let i = 0; i < numChars; i++){
    let c = Math.floor(Math.random() * 61);
    console.log(c);
    result.push(chars[c]);
  }
  return result.join('');
}


console.log(generateRandomString());