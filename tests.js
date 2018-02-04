    report("Simple expressions")
 
    report(diff("5"), "0", "constant should return 0");
    report(diff("x"), "1", "x should return 1");
    report(diff("(+ x x)"), "2", "x+x should return 2");
    report(diff("(- x x)"), "0", "x-x should return 0");
    report(diff("(* x 2)"), "2", "2*x should return 2");
    report(diff("(/ x 2)"), "0.5", "x/2 should return 0.5");
    report(diff("(^ x 2)"), "(* 2 x)", "x^2 should return 2*x");
    report(diff("(cos x)"), "(* -1 (sin x))", "cos(x) should return -1 * sin(x)");
    report(diff("(sin x)"), "(cos x)", "sin(x) should return cos(x)");
    report(diff("(tan x)"), "(+ 1 (^ (tan x) 2))", "tan(x) should return 1 + tan(x)^2");
    report(diff("(exp x)"), "(exp x)", "exp(x) should return exp(x)");
    report(diff("(ln x)"), "(/ 1 x)", "ln(x) should return 1/x");

report("Nested expressions");
    report(diff("(+ x (+ x x))"), "3", "x+(x+x) should return 3");
    report(diff("(- (+ x x) x)"), "1", "(x+x)-x should return 1");
    report(diff("(* 2 (+ x 2))"), "2", "2*(x+2) should return 2");
    report(diff("(/ 2 (+ 1 x))"), "(/ -2 (^ (+ 1 x) 2))", "2/(1+x) should return -2/(1+x)^2");
    report(diff("(cos (+ x 1))"), "(* -1 (sin (+ x 1)))", "cos(x+1) should return -1 * sin(x+1)");
   
    // // Accepting (* 2 (* -1 (sin (* 2 x)))) or (* -2 (sin (* 2 x)))
    let result = diff("(cos (* 2 x))");
    // Test.expect((result == "(* 2 (* -1 (sin (* 2 x))))" || result == "(* -2 (sin (* 2 x)))"),
    //   "Expected (* 2 (* -1 (sin (* 2 x)))) or (* -2 (sin (* 2 x))) but got " + result);
      
    report(diff("(sin (+ x 1))"), "(cos (+ x 1))", "sin(x+1) should return cos(x+1)");
    report(diff("(sin (* 2 x))"), "(* 2 (cos (* 2 x)))", "sin(2*x) should return 2*cos(2*x)");
    report(diff("(tan (* 2 x))"), "(* 2 (+ 1 (^ (tan (* 2 x)) 2)))", "tan(2*x) should return 2 * (1 + tan(2*x)^2)");
    report(diff("(exp (* 2 x))"), "(* 2 (exp (* 2 x)))", "exp(2*x) should return 2*exp(2*x)");


report("Second derivatives");
  report(diff(diff("(sin x)")), "(* -1 (sin x))", "Second deriv. sin(x) should return -1 * sin(x)");
  report(diff(diff("(exp x)")), "(exp x)", "Second deriv. exp(x) should return exp(x)");
  
  // Accepting (* 3 (* 2 x)) or (* 6 x)
  let result1=diff("(^ x 3)")
  console.log(result1);
  let result2 = diff(result1);
  console.log(result2)

