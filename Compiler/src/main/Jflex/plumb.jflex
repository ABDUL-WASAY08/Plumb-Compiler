

%%
%class PlumbLexer
%unicode
%line
%column
%type Token

%{
    
    static class Token {
        final String type;
        final String value;
        final int line;
        final int column;

        Token(String type, String value, int line, int column) {
            this.type = type;
            this.value = value;
            this.line = line;
            this.column = column;
        }
    }
%}


Whitespace     = [ \t\r\n]+
Identifier     = [a-zA-Z_][a-zA-Z0-9_]*
Number         = [0-9]+(\.[0-9]+)?([eE][+-]?[0-9]+)?
StringLiteral  = \"([^\"\\]|\\.)*\"
Comment        = "#".*
Operator       = [\+\-\*/<>=!]=?

%%

{Whitespace}     {}
{Comment}        {}


"pipeline"       { return new Token("KEYWORD", yytext(), yyline + 1, yycolumn + 1); }
"read"           { return new Token("KEYWORD", yytext(), yyline + 1, yycolumn + 1); }
"filter"         { return new Token("KEYWORD", yytext(), yyline + 1, yycolumn + 1); }
"transform"      { return new Token("KEYWORD", yytext(), yyline + 1, yycolumn + 1); }
"output"         { return new Token("KEYWORD", yytext(), yyline + 1, yycolumn + 1); }
"log"            { return new Token("KEYWORD", yytext(), yyline + 1, yycolumn + 1); }


{Operator}       { return new Token("OPERATOR", yytext(), yyline + 1, yycolumn + 1); }


{Identifier}     { return new Token("IDENTIFIER", yytext(), yyline + 1, yycolumn + 1); }
{Number}         { return new Token("NUMBER", yytext(), yyline + 1, yycolumn + 1); }
{StringLiteral}  { return new Token("STRING", yytext(), yyline + 1, yycolumn + 1); }

","              { return new Token("COMMA", yytext(), yyline + 1, yycolumn + 1); }


.                { return new Token("ERROR", yytext(), yyline + 1, yycolumn + 1); }
