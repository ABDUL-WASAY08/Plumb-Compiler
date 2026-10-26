import java.io.StringReader;

public class LexerRunner {

    public static void main(String[] args) throws Exception {
        if (args.length == 0) {
            System.err.println("Usage: java LexerRunner \"<plumb source code>\"");
            System.exit(1);
        }
        String source = String.join(" ", args);
        PlumbLexer lexer = new PlumbLexer(new StringReader(source));
        StringBuilder json = new StringBuilder("[");
        boolean first = true;
        PlumbLexer.Token token;
        while ((token = lexer.yylex()) != null) {
            if (!first) {
                json.append(',');
            }
            first = false;

            json.append("{\"type\":\"").append(escape(token.type))
                .append("\",\"value\":\"").append(escape(token.value))
                .append("\",\"line\":").append(token.line)
                .append(",\"column\":").append(token.column)
                .append('}');
        }

        json.append(']');
        System.out.println(json);
    }
    private static String escape(String text) {
        StringBuilder out = new StringBuilder();
        for (int i = 0; i < text.length(); i++) {
            char c = text.charAt(i);
            switch (c) {
                case '"':  out.append("\\\""); break;
                case '\\': out.append("\\\\"); break;
                case '\n': out.append("\\n");  break;
                case '\r': out.append("\\r");  break;
                case '\t': out.append("\\t");  break;
                default:
                    if (c < 0x20) {
                        out.append(String.format("\\u%04x", (int) c));
                    } else {
                        out.append(c);
                    }
            }
        }
        return out.toString();
    }
}
