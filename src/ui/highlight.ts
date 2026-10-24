// Zeilenweiser Syntax-Highlighter für die Sprachen der Lektionen.
// Bewusst klein gehalten: Kommentare, Strings, Zahlen, Schlüsselwörter, Typen, Präprozessor,
// bei Rust zusätzlich Attribute, Makros, Lifetimes und Zeichenliterale, bei TOML Tabellen und Schlüssel.
import { escapeHtml } from './dom';

interface SprachDef {
  zeilenKommentar: string[];
  blockKommentar: boolean;
  schluessel: Set<string>;
  typen: Set<string>;
  praeprozessor?: boolean;
  variablen?: boolean; // $VAR, ${VAR}
  yamlSchluessel?: boolean;
  rust?: boolean; // #[attr], makro!, 'a, 'x', fn-Aufrufe
  toml?: boolean; // [tabelle], schluessel =
  strings: boolean;
}

const w = (s: string) => new Set(s.split(/\s+/).filter(Boolean));

const CPP_KW = w(`alignas alignof and asm break case catch class co_await co_return co_yield concept const consteval
  constexpr constinit const_cast continue decltype default delete do dynamic_cast else enum explicit export extern
  false final for friend goto if inline mutable namespace new noexcept not nullptr operator or override private
  protected public register reinterpret_cast requires return sizeof static static_assert static_cast struct switch
  template this thread_local throw true try typedef typeid typename union using virtual volatile while`);
const CPP_TYP = w(`auto bool char char8_t char16_t char32_t double float int long short signed unsigned void wchar_t
  size_t ssize_t int8_t int16_t int32_t int64_t uint8_t uint16_t uint32_t uint64_t uintptr_t std string vector
  unique_ptr shared_ptr weak_ptr optional expected variant array map unordered_map mutex atomic thread jthread
  string_view span function lock_guard scoped_lock unique_lock`);

const RUST_KW = w(`as async await break const continue crate dyn else enum extern false fn for if impl in let loop
  match mod move mut pub ref return self Self static struct super trait true type union unsafe use where while
  macro_rules yield`);
const RUST_TYP = w(`i8 i16 i32 i64 i128 isize u8 u16 u32 u64 u128 usize f32 f64 bool char str String Vec Box Option
  Result Some None Ok Err Rc Arc Weak Cell RefCell Mutex RwLock HashMap BTreeMap HashSet VecDeque Cow Pin PhantomData
  MaybeUninit NonNull Ordering Send Sync Sized Copy Clone Drop Debug Display Default Iterator IntoIterator Fn FnMut
  FnOnce From Into AsRef Deref Future Sender Receiver JoinHandle AtomicBool AtomicUsize AtomicU32 core std alloc`);

const SPRACHEN: Record<string, SprachDef> = {
  rust: { zeilenKommentar: ['//'], blockKommentar: true, schluessel: RUST_KW, typen: RUST_TYP, rust: true, strings: true },
  toml: {
    zeilenKommentar: ['#'], blockKommentar: false, strings: true, toml: true,
    schluessel: w('true false'), typen: w(''),
  },
  cpp: { zeilenKommentar: ['//'], blockKommentar: true, schluessel: CPP_KW, typen: CPP_TYP, praeprozessor: true, strings: true },
  c: { zeilenKommentar: ['//'], blockKommentar: true, schluessel: CPP_KW, typen: CPP_TYP, praeprozessor: true, strings: true },
  bash: {
    zeilenKommentar: ['#'], blockKommentar: false, strings: true, variablen: true,
    schluessel: w('if then else elif fi for in do done while case esac function return export local set echo cd'),
    typen: w(`cargo rustc rustup rustdoc rustfmt rustfilt rust-gdb rust-lldb probe-rs g++ gcc clang clang++ nm objdump
      readelf ld ar make cmake ninja ldd gdb valgrind strip size file git bazel`),
  },
  cmake: {
    zeilenKommentar: ['#'], blockKommentar: false, strings: true, variablen: true,
    schluessel: w(`cmake_minimum_required project add_executable add_library target_link_libraries
      target_include_directories target_compile_options target_compile_definitions target_compile_features
      find_package set option if else elseif endif foreach endforeach add_subdirectory install include
      enable_testing add_test message function endfunction FetchContent_Declare FetchContent_MakeAvailable`),
    typen: w('PUBLIC PRIVATE INTERFACE STATIC SHARED REQUIRED CXX VERSION LANGUAGES COMPONENTS ON OFF'),
  },
  make: {
    zeilenKommentar: ['#'], blockKommentar: false, strings: true, variablen: true,
    schluessel: w('.PHONY ifeq ifneq else endif include define endef'), typen: w(''),
  },
  yaml: {
    zeilenKommentar: ['#'], blockKommentar: false, strings: true, yamlSchluessel: true, variablen: true,
    schluessel: w('true false null'), typen: w(''),
  },
  groovy: {
    zeilenKommentar: ['//'], blockKommentar: true, strings: true, variablen: true,
    schluessel: w(`pipeline agent stages stage steps post always success failure when environment options
      parameters node def return if else for in try catch finally import library call script parallel`),
    typen: w('sh echo checkout junit archiveArtifacts withCredentials String Map List'),
  },
  json: { zeilenKommentar: [], blockKommentar: false, strings: true, schluessel: w('true false null'), typen: w('') },
  asm: {
    zeilenKommentar: ['#', ';'], blockKommentar: false, strings: true,
    schluessel: w('call ret mov movl movq push pushq pop popq lea leaq add sub jmp je jne cmp xor nop'),
    typen: w('rax rbx rcx rdx rsi rdi rbp rsp rip eax edi esi'),
  },
  starlark: {
    zeilenKommentar: ['#'], blockKommentar: false, strings: true,
    schluessel: w('load def return if else for in True False None'),
    typen: w('cc_library cc_binary cc_test name srcs hdrs deps visibility copts'),
  },
  python: {
    zeilenKommentar: ['#'], blockKommentar: false, strings: true,
    schluessel: w('def return if elif else for in while import from as class with try except True False None'),
    typen: w(''),
  },
  linker: {
    zeilenKommentar: [], blockKommentar: true, strings: true,
    schluessel: w('MEMORY SECTIONS ENTRY KEEP ALIGN AT ORIGIN LENGTH PROVIDE'),
    typen: w('FLASH RAM'),
  },
  text: { zeilenKommentar: [], blockKommentar: false, strings: false, schluessel: w(''), typen: w('') },
};

const span = (klasse: string, text: string) => `<span class="tok-${klasse}">${escapeHtml(text)}</span>`;

function zeileHervorheben(src: string, def: SprachDef, imBlock: boolean): [string, boolean] {
  let out = '';
  let i = 0;

  if (def.praeprozessor && !imBlock) {
    const m = /^(\s*#\s*[A-Za-z_]+)(.*)$/.exec(src);
    if (m) {
      out += span('pp', m[1]);
      i = m[1].length;
      const rest = m[2];
      const inc = /^(\s*)(<[^>]*>)(.*)$/.exec(rest);
      if (inc) {
        out += escapeHtml(inc[1]) + span('str', inc[2]);
        i += inc[1].length + inc[2].length;
      }
    }
  }
  if (def.yamlSchluessel && !imBlock) {
    const m = /^(\s*-?\s*)([\w.\-/]+)(:)(?=\s|$)/.exec(src);
    if (m) {
      out += escapeHtml(m[1]) + span('kw', m[2]) + escapeHtml(m[3]);
      i = m[0].length;
    }
  }

  if (def.toml && !imBlock) {
    const tab = /^(\s*)(\[\[?[^\]]*\]\]?)/.exec(src);
    const key = /^(\s*)([\w.\-"]+)(\s*=)/.exec(src);
    if (tab) {
      out += escapeHtml(tab[1]) + span('kw', tab[2]);
      i = tab[0].length;
    } else if (key) {
      out += escapeHtml(key[1]) + span('typ', key[2]) + escapeHtml(key[3]);
      i = key[0].length;
    }
  }

  while (i < src.length) {
    const rest = src.slice(i);
    if (imBlock) {
      const ende = src.indexOf('*/', i);
      if (ende < 0) {
        out += span('com', rest);
        return [out, true];
      }
      out += span('com', src.slice(i, ende + 2));
      i = ende + 2;
      imBlock = false;
      continue;
    }
    if (def.blockKommentar && rest.startsWith('/*')) {
      const ende = src.indexOf('*/', i + 2);
      if (ende < 0) {
        out += span('com', rest);
        return [out, true];
      }
      out += span('com', src.slice(i, ende + 2));
      i = ende + 2;
      continue;
    }
    const kommentar = def.zeilenKommentar.find((p) => rest.startsWith(p));
    if (kommentar && (kommentar !== '#' || i === 0 || /\s/.test(src[i - 1]))) {
      out += span('com', rest);
      break;
    }
    const c = src[i];
    if (def.rust && !imBlock) {
      const attr = /^#!?\[[^\]]*\]?/.exec(rest);
      if (attr && c === '#') {
        out += span('pp', attr[0]);
        i += attr[0].length;
        continue;
      }
      if (c === "'") {
        const zeichen = /^'(\\(x[0-9a-fA-F]{2}|u\{[0-9a-fA-F]+\}|.)|[^'\\])'/.exec(rest);
        const lifetime = /^'[A-Za-z_]\w*/.exec(rest);
        if (zeichen) {
          out += span('str', zeichen[0]);
          i += zeichen[0].length;
          continue;
        }
        if (lifetime) {
          out += span('typ', lifetime[0]);
          i += lifetime[0].length;
          continue;
        }
      }
      const roh = /^b?r(#*)"/.exec(rest);
      if (roh && (i === 0 || !/\w/.test(src[i - 1]))) {
        const ende = src.indexOf('"' + roh[1], i + roh[0].length);
        const bis = ende < 0 ? src.length : ende + 1 + roh[1].length;
        out += span('str', src.slice(i, bis));
        i = bis;
        continue;
      }
    }
    if (def.strings && (c === '"' || c === "'")) {
      let j = i + 1;
      while (j < src.length && src[j] !== c) j += src[j] === '\\' ? 2 : 1;
      out += span('str', src.slice(i, j + 1));
      i = j + 1;
      continue;
    }
    if (def.variablen && c === '$') {
      const m = /^\$(\{[^}]*\}|\(\([^)]*\)\)|[A-Za-z_]\w*|\{\{[^}]*\}\})/.exec(rest);
      if (m) {
        out += span('var', m[0]);
        i += m[0].length;
        continue;
      }
    }
    if (/\d/.test(c) && (i === 0 || !/[\w.]/.test(src[i - 1]))) {
      const m = def.rust
        ? /^(0x[0-9a-fA-F_]+|0b[01_]+|0o[0-7_]+|\d[\d_]*(\.\d[\d_]*)?)(_?([iu](8|16|32|64|128|size)|f32|f64))?/.exec(rest)
        : /^(0x[0-9a-fA-F']+|\d[\d']*(\.\d+)?)[uUlLfF]*/.exec(rest);
      if (m) {
        out += span('num', m[0]);
        i += m[0].length;
        continue;
      }
    }
    const wort = /^[A-Za-z_][\w+]*/.exec(rest);
    if (wort) {
      let text = wort[0];
      // '+' gehört nur bei g++/clang++ zum Wort
      if (text.includes('+') && !def.typen.has(text)) text = /^[A-Za-z_]\w*/.exec(rest)![0];
      if (def.rust && src[i + text.length] === '!' && src[i + text.length + 1] !== '=') {
        out += span('fn', text + '!');
        i += text.length + 1;
        continue;
      }
      if (def.schluessel.has(text)) out += span('kw', text);
      else if (def.typen.has(text)) out += span('typ', text);
      else if (def.rust && /^[A-Z]/.test(text) && /[a-z]/.test(text)) out += span('typ', text);
      else if (src[i + text.length] === '(' && (def.praeprozessor || def.rust)) out += span('fn', text);
      else out += escapeHtml(text);
      i += text.length;
      continue;
    }
    out += escapeHtml(c);
    i++;
  }
  return [out, imBlock];
}

export function zeilenHervorheben(zeilen: string[], sprache: string): string[] {
  const def = SPRACHEN[sprache] ?? SPRACHEN.text;
  let imBlock = false;
  return zeilen.map((z) => {
    const [html, block] = zeileHervorheben(z, def, imBlock);
    imBlock = block;
    return html;
  });
}

/** Hebt Codefragmente hervor, die durch Lücken unterbrochen sind (Kontext bleibt erhalten). */
export function fragmenteHervorheben(fragmente: string[], sprache: string): string[] {
  return fragmente.map((f) => zeilenHervorheben([f], sprache)[0]);
}
