var diff = (function(){
    let env = Object.create(null);
    env["*"] = function(f,g){
       let  _f = derive(Object.assign({},f),env);
       let _g = derive(Object.assign({},g),env); 
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
    env["-"] = function(f,g){
       let  _f = derive(Object.assign({},f),env);
       let _g = derive(Object.assign({},g),env); 
       let args = [_f ,_g];
       return {type: "apply",operator: "-", args: args};
    }
    env["+"] = function(f,g){
       let  _f = derive(Object.assign({},f),env);
       let _g = derive(Object.assign({},g),env); 
       let args = [_f, _g];
       return {type: "apply",operator:"+", args: args};
    }
    env["/"] = function(f,g){
       let  _f = derive(Object.assign({},f),env);
       let _g = derive(Object.assign({},g),env); 
       let args =[];
       args.push({type: "apply",operator: "*", args: [_f,g]})
       args.push({type: "apply",operator: "*", args: [f,_g]})
       let  dividend = {type: "apply",operator: "-", args: args};
       let  divisor = {type: "apply",operator: "*", args: [g,g]};
       return {type: "apply",operator: "/", args: [dividend,divisor]}
    }
    env["cos"] = function(x){
        if(x.type === 'variable'){
          return {type: "apply",operator:"*", args: [{type:'value',value: -1},
                   {type: "apply",operator:"sin", args: [x.value]}]};
        }else if(x.type === 'value'){
             return -1*Math.sin(parseFloat(x.value));
        }else if(x.type === 'apply'){
            let args = [];
            args.push({type: "apply",operator:"*", args: [{type:'value',value: -1},derive(x)]});
            args.push({type: "apply",operator:"sin", args: [x]});
            return {type: "apply",operator:"*", args: args};
        }
    }
    env["sin"] = function(x){
        if(x.type === 'variable'){
          return {type:'apply',operator:'cos',args:[x.value]};
        }else if(x.type === 'value'){
             return Math.cos(parseFloat(x.value));
        }else if(x.type === 'apply'){
          let args = [];
           args.push(derive(x));
           args.push({type: "apply",operator:"cos", args: [x]});
          return {type: "apply",operator:"*", args: args};
        }
    }
    env["tan"] = function(x){
      if(x.type === 'variable'){
         let args = [{type:'value',value: 1},
                        {type: 'apply',operator:"^",args: [{type:'apply',operator:'tan',args:[x.value]},
                                                                     {type:'value',value:2}
                                                                     ]
                        }
                        ];
         return {type: 'apply'  ,operator:"+",args :args};
        }else if(x.type === 'value'){
             return 1 + Math.pow(Math.tan(parseFloat(x.value)),2);
        }else if(x.type === 'apply'){
          let args = [{type:'value',value: 1},
                    {type: 'apply',operator:"^",args: [{type:'apply',operator:'tan',args:[x]},
                                                                 {type:'value',value:2}
                                                                 ]
                    }
                    ];
         return {type: 'apply',operator:"*",args: [derive(x,env),{type: 'apply'  ,operator:"+",args :args}]}          
        }
    }
    env["exp"] = function(x){
      if(x.type === 'variable'){
          return {type: 'apply',operator: 'exp',args:[x.value]};
        }else if(x.type === 'value'){
             return Math.exp(parseFloat(x.value));
        }else if(x.type === 'apply'){
            return {type: 'apply',operator: "*",args:[derive(x),{type: 'apply',operator: 'exp',args:[x]}]};
        }
    }
    env["ln"] = function(x){
      if(x.type === 'variable'){
         return {type: 'apply',operator: "/",args:[{type: 'value',value:1},x.value]};
        }else if(x.type === 'value'){
             return 1/parseFloat(x.value)
        }else if(x.type === 'apply'){
           return {type: 'apply',operator: "*",args:[derive(x),
                    {type: 'apply',operator: "/",args:[{type: 'value',value:1},x]}]};
        }
    }
    env["^"] = function(f,n){
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
    function reduce(...args){
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
    function reduceplus(value1,op,value2){
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
    function calc(value1,op,value2){
      if(typeof(value1)==='number' && typeof(value2)==='number'  )
        switch(op){
          case "+" : return value1 + value2;
          case "-" : return value1 - value2;
          case "*" : return value1 * value2;
          case "/" : return value1 / value2;
        }
      return [value1,op,value2];
    }
    function format(arr){
      if(typeof(arr[0]) !== 'string') [arr[0],arr[1]] =  [arr[1],arr[0]];
          if(arr.length === 3)
              return `(${arr[0]} ${Array.isArray(arr[1]) ? format(arr[1]): arr[1]} ${Array.isArray(arr[2]) ? format(arr[2]): arr[2]})`
           else  if(arr.length === 2)
              return `(${arr[0]} ${Array.isArray(arr[1]) ? format(arr[1]): arr[1]})`
    }
    function converteplus(operation){
          let operator=  typeof(operation.operator) === 'object'  && 'name' in operation.operator ? 
          operation.operator.name : operation.operator;
          let result = {type: 'func',body:[]}
          let left = converte(operation.args[0]);
          left = typeof(left) === 'object' && 'body' in left ? left.body : left;
          result.body.push(operator);
          result.body.push(left);   
          return result;   
    }
    function converte(operation){
       if(operation.type !== 'apply'){
          return operation.value ? operation.value : operation;
       }else{
          if(operation.args.length < 2){
            return converteplus(operation);
          }
          let operator=  typeof(operation.operator) === 'object'  && 'name' in operation.operator ? 
          operation.operator.name : operation.operator;
          let result = {type: 'func',body:[]}
          let left = converte(operation.args[0]);
          left = typeof(left) === 'object' && 'body' in left ? left.body : left;
          result.body.push(left);
          result.body.push(operator);
          let right = converte(operation.args[1]);
          right = typeof(right) === 'object' && 'body' in right ? right.body : right;
          result.body.push(right);
          result.body=calc(...result.body);
          if(typeof(result.body) === 'number')
           return result.body;
         result.body = reduceplus(...result.body);
          if(typeof(result.body) === 'number')
           return result.body;
         result.body = reduce(...result.body);
         if(result.body.length < 3) return result;
         result.body = [result.body[1],result.body[0],result.body[2]];
         return result;
       }  
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
    function derive(expr) {
      switch(expr.type) {
          case "value": return 0;  
          case "variable": return 1;   
          case "apply":
             if (expr.operator.name in env){
                  let result = env[expr.operator.name](...expr.args);
                  return result;
             }else{
               throw new TypeError("Applying a non-function.");
             } 
      }        
    }
    return function(expr) {
      var regex = /\s*(=>|[-+*\/\%=\(\)]|[A-Za-z_][A-Za-z0-9_]*|[0-9]*\.?[0-9]+)\s*/g;
      let tokens= expr.split(regex).filter(function (s) { return !s.match(/^\s*$/); });
      let result=  converte(derive(parse(tokens), env));
      if(result && result.type === 'func')
              return format(result.body);
      return `${result}`;
    }
})();