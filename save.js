function multiPoly(p1,p2){
    let [prefix1,prefix2] = [parseFloat(p1),parseFloat(p2)];
    prefix1 = isNaN(prefix1) ? 1  : prefix1;
    prefix2 = isNaN(prefix2) ? 1  : prefix2;
    let [power1,power2] = [p1.split('^'),p2.split('^')];
    power1 = power1.length > 1 ? parseFloat(power1[1]) : (p1.match('x') ? 1 : 0);
    power2 = power2.length > 1 ? parseFloat(power2[1]) : (p2.match('x') ? 1 : 0);
    let x = power1+power2 === 0 ? 1 : (power1+power2) === 1 ? 'x' : `x^${power1+power2}` 
    return prefix1 * prefix2 === 1 ? `${x}` : `${(prefix1 * prefix2)}${x}`;
}


var topEnv = Object.create(null);
// var func = Object.create(null);
function which3(...args){
  if(args.length < 3) return args;
  let [value1,op,value2] = [...args]
if(value1.toString() === value2.toString())
  switch(op){
      case "+" : return [2 ,"*", value2];
      case "-" : return 0;
      case "*" : return [value1 ,"^", 2];
      case "/" : return 1;
    }
  return [value1,op,value2];
}
function which2(value1,op,value2){
     switch(op){
      case "+" : return typeof(value1) === 'number' 
                             && value1=== 0 ? value2 : (typeof(value2) === 'number' 
                             && value2=== 0? value1: [value1,op,value2]);
      // case "-" : return value1 - value2;
      case "*" : return  typeof(value1) === 'number' 
                             && value1=== 0 ? 0 : (typeof(value2) === 'number' 
                             && value2=== 0? 0: (typeof(value1) === 'number' 
                             && value1=== 1 ? value2 : (typeof(value2) === 'number' 
                             && value2=== 1? value1: [value1,op,value2])));
      case "/" : return  typeof(value1) === 'number' 
                             && value1=== 0 ? 0 : [value1,op,value2];
    }
  return [value1,op,value2];
}
function which(value1,op,value2){
  if(typeof(value1)==='number' && typeof(value2)==='number'  )
    switch(op){
      case "+" : return value1 + value2;
      case "-" : return value1 - value2;
      case "*" : return value1 * value2;
      case "/" : return value1 / value2;
    }
  return [value1,op,value2];
}
function _reduce(arr){
  if(typeof(arr[0]) !== 'string') [arr[0],arr[1]] =  [arr[1],arr[0]];
      if(arr.length === 3)
          return `(${arr[0]} ${Array.isArray(arr[1]) ? _reduce(arr[1]): arr[1]} ${Array.isArray(arr[2]) ? _reduce(arr[2]): arr[2]})`
       else  if(arr.length === 2)
          return `(${arr[0]} ${Array.isArray(arr[1]) ? _reduce(arr[1]): arr[1]})`
}
function reduceFn(operation){
      let operator=  typeof(operation.operator) === 'object'  && 'name' in operation.operator ? 
      operation.operator.name : operation.operator;
      let result = {type: 'func',body:[]}
      let left = reduce(operation.args[0]);
      left = typeof(left) === 'object' && 'body' in left ? left.body : left;
      result.body.push(operator);
      result.body.push(left);   
      return result;   
}
function reduce(operation){
   if(operation.type !== 'apply'){
      return operation.value ? operation.value : operation;
   }else{
      if(operation.args.length < 2){
        return reduceFn(operation);
      }
      let operator=  typeof(operation.operator) === 'object'  && 'name' in operation.operator ? 
      operation.operator.name : operation.operator;
      let result = {type: 'func',body:[]}
      let left = reduce(operation.args[0]);
      left = typeof(left) === 'object' && 'body' in left ? left.body : left;
      result.body.push(left);
      result.body.push(operator);
      let right = reduce(operation.args[1]);
      right = typeof(right) === 'object' && 'body' in right ? right.body : right;
      result.body.push(right);
      result.body=which(...result.body);
      if(typeof(result.body) === 'number')
       return result.body;
     result.body = which2(...result.body);
      if(typeof(result.body) === 'number')
       return result.body;
     result.body = which3(...result.body);
     if(result.body.length < 3) return result;
     result.body = [result.body[1],result.body[0],result.body[2]];
   // return _reduce(...result.body);
   return result;
   }
   
}
topEnv["*"] = function(f,g){
   let  _f = derive(Object.assign({},f),topEnv);
   let _g = derive(Object.assign({},g),topEnv); 
   let args =[];
   if(_f.type === 'value' && g.type === 'value'){
         args.push({type: 'value',value : parseFloat(_f.value) * parseFloat(g.value)})
   }else{
       args.push({type: "apply",operator: "*", args: [_f ,g]})
   }
   if(f.type === 'value' && _g.type === 'value'){
         args.push({type: 'value',value : parseFloat(f.value) * parseFloat(_g.value)})
   }else{
       args.push({type: "apply",operator: "*", args: [f ,_g]})
   }   
   if(args[0].type === 'value' && args[1].type === 'value'){

    return {type: 'value',value: args[0] + args[1]}
   }else{

       return {type: "apply",operator: "+", args: args};  
   }   
}
topEnv["-"] = function(f,g){
   let  _f = derive(Object.assign({},f),topEnv);
   let _g = derive(Object.assign({},g),topEnv); 
   let args = [_f ,_g];
   return {type: "apply",operator: "-", args: args};
}
topEnv["+"] = function(f,g){
   let  _f = derive(Object.assign({},f),topEnv);
   let _g = derive(Object.assign({},g),topEnv); 
   let args = [_f, _g];
   return {type: "apply",operator:"+", args: args};
}
topEnv["/"] = function(f,g){
   let  _f = derive(Object.assign({},f),topEnv);
   let _g = derive(Object.assign({},g),topEnv); 
   let args =[];
   args.push({type: "apply",operator: "*", args: [_f,g]})
   args.push({type: "apply",operator: "*", args: [f,_g]})
   let  dividend = {type: "apply",operator: "-", args: args};
   let  divisor = {type: "apply",operator: "*", args: [g,g]};
   return {type: "apply",operator: "/", args: [dividend,divisor]}
   // return `${((_f===0 ? 0 : g.value *_f ) - (_g===0 ? 0 : f.value*_g)) / (g.value*g.value)}`
}
topEnv["cos"] = function(x){
    if(x.type === 'variable'){
      return {type: "apply",operator:"*", args: [{type:'value',value: -1},{type: "apply",operator:"sin", args: [x.value]}]};
      // return  `(* -1 (sin ${x.value}))`;
    }else if(x.type === 'value'){
         return -1*Math.sin(parseFloat(x.value));
    }else if(x.type === 'apply'){
      let args = [];
      args.push({type: "apply",operator:"*", args: [{type:'value',value: -1},derive(x)]});
       args.push({type: "apply",operator:"sin", args: [x]});
      return {type: "apply",operator:"*", args: args};
    }
}
topEnv["sin"] = function(x){
    if(x.type === 'variable'){
      return {type:'apply',operator:'cos',args:[x.value]};
      // return  `(cos ${x.value})`;
    }else if(x.type === 'value'){
         return Math.cos(parseFloat(x.value));
    }else if(x.type === 'apply'){
      let args = [];
       args.push(derive(x));
       args.push({type: "apply",operator:"cos", args: [x]});
      return {type: "apply",operator:"*", args: args};
    }
}
topEnv["tan"] = function(x){
  if(x.type === 'variable'){
     let args = [{type:'value',value: 1},
                    {type: 'apply',operator:"^",args: [{type:'apply',operator:'tan',args:[x.value]},
                                                                 {type:'value',value:2}
                                                                 ]
                    }
                    ];
     return {type: 'apply'  ,operator:"+",args :args};
      // return  `(+ 1 (^ (tan ${x.value}) 2))`;
    }else if(x.type === 'value'){
         return 1 + Math.pow(Math.tan(parseFloat(x.value)),2);
    }else if(x.type === 'apply'){
      let args = [{type:'value',value: 1},
                {type: 'apply',operator:"^",args: [{type:'apply',operator:'tan',args:[x]},
                                                             {type:'value',value:2}
                                                             ]
                }
                ];
     return {type: 'apply',operator:"*",args: [derive(x,topEnv),{type: 'apply'  ,operator:"+",args :args}]}          
    }
}
topEnv["exp"] = function(x){
  if(x.type === 'variable'){
      return {type: 'apply',operator: 'exp',args:[x.value]};
      // return  `(exp ${x.value})`;
    }else if(x.type === 'value'){
         return Math.exp(parseFloat(x.value));
    }else if(x.type === 'apply'){
        return {type: 'apply',operator: "*",args:[derive(x),{type: 'apply',operator: 'exp',args:[x]}]};
    }
}
topEnv["ln"] = function(x){
  if(x.type === 'variable'){
     return {type: 'apply',operator: "/",args:[{type: 'value',value:1},x.value]};
      // return  `(/ 1 ${x.value})`;
    }else if(x.type === 'value'){
         return 1/parseFloat(x.value)
    }else if(x.type === 'apply'){
       return {type: 'apply',operator: "*",args:[derive(x),{type: 'apply',operator: "/",args:[{type: 'value',value:1},x]}]};
    }
}
topEnv["^"] = function(f,n){
  if(f.type === 'variable' && n.type === 'value'){
    if(parseFloat(n.value) === 2) return  {type: 'apply',operator:"*",args:[n,f]};
    let _n=Object.assign({},n);
    _n.value = _n.value - 1;
    return {type: 'apply',operator:"*",args:[n,{type: 'apply',operator:"^",args:[f,_n]}]};
  }else if(f.type === 'apply' && n.type === 'value'){
         if(n === 2) return  {type: 'apply',operator:"*",args:[n,f]};
         let _n=Object.assign({},n);
         _n.value = _n.value - 1;
         return  {type: 'apply',operator:"*",args:[n,{type: 'apply',operator:"^",args:[f,_n]}]}; //n*derive(f)
  }
  
}
function diff(expr) {
  let tokens = tokenize(expr);
  let program=  parse(tokens);
  // return derive(program, topEnv); //don't forget to drop it
  let result=  reduce(derive(program, topEnv));
  if(result && result.type === 'func')
       return _reduce(result.body);
   return `${result}`;
}
function tokenize(program){
    if (program === "")
        return [];
    var regex = /\s*(=>|[-+*\/\%=\(\)]|[A-Za-z_][A-Za-z0-9_]*|[0-9]*\.?[0-9]+)\s*/g;
    return program.split(regex).filter(function (s) { return !s.match(/^\s*$/); });
}
function parseExpression(program) {
  var match, expr;
   if (match = /^\d+\b/.exec(program[0]))
    expr = {type: "value", value: Number(match[0])};
  else if (program[0] === 'x')
    expr = {type: "variable", value: 'x'};
  else if (program[0] === '(')
    expr = {type: "delimiter", value: '('};
  else if (match = /^[^\s(),"]+/.exec(program[0]))
    expr = {type: "word", name: match[0]};
  else
    throw new SyntaxError("Unexpected syntax: " + program[0]);
  program.shift();
  return parseApply(expr, program);
}
function parse(program) {
  var result = parseExpression(program);
  if (program.length > 0)
    throw new SyntaxError("Unexpected text after program");
  return result;
}
function parseApply(expr, program) {
  if (expr.type != "delimiter")
    return expr;
  expr = {type: "apply", operator: parseExpression(program), args: []};
  while (program.length > 0 && program[0] != ")" ) {
      var arg = parseExpression(program);
      expr.args.push(arg);
      }
   if (program[0] != ")")
      throw new SyntaxError("Expected  ')'");
    program.shift();
   return parseApply(expr, program);
}
function derive(expr, env) {
  switch(expr.type) {
    case "value":{
        expr.value=0;
        return 0;
    }
    case "variable":{
        expr.value=1;
        expr.type= 'value';
        return 1;
    }      
    case "apply":
       if (expr.operator.name in topEnv){
            let result = topEnv[expr.operator.name](...expr.args);
           return result;
       }
          
       else
           throw new TypeError("Applying a non-function.");
    }
}
function calc(expr,env){
  switch(expr.type) {
    case "value":{
        return expr.value;
    }
    case "variable":{
        return expr.value;
    }      
    case "apply":
       if (expr.operator in func)
           return func[expr.operator](...expr.args);
       else
           // throw new TypeError("Applying a non-function.");
         return expr;
    }
}
