import 'should'
import Blacking from './blacking'

describe('Main', function () {
  it('Strings without tags', function () {
    Blacking("Hello World!", {}).should.equal("Hello World!");
  });
  it('Strings with empty tag', function () {
    Blacking("[]{Hello World}!", {}).should.equal("Hello World!");
  });
  it('Passes content (partial) to allowed groups', function () {
    Blacking("Hello [+group]{World}!", { groups: ["group"]}).should.equal("Hello World!");
  });
  it('Passes content (everything) to allowed groups', function () {
    Blacking("[+group]{Hello World}!", { groups: ["group"]}).should.equal("Hello World!");
  });
  it('Hides content (partial) from users without groups', function () {
    Blacking("Hello [+group]{World}", { }).trim().should.equal("Hello");
  });
  it('Hides content (everything) from users without groups', function () {
    Blacking("[+group]{Hello World}", { }).trim().should.equal("");
  });
  it('Hides content from users in other groups', function () {
    Blacking("Hello [+group]{World}", { groups: [ 'other' ] }).trim().should.equal("Hello");
  });
  it('Several content blocks with different allowed groups', function () {
    Blacking("[+group]{Hello} [+group2]{World}!", { groups: ["group", "group2"]}).should.equal("Hello World!");
  });
  it('Blacks content', function () {
    Blacking("Hello [+group =█]{World}!", { groups: []}).should.equal("Hello █████!");
  });
  it('Blacking keeps punctuation', function () {
    Blacking("Hello [+group =█]{World, things (many) - and more!}", { groups: []})
      .should.equal("Hello █████, ██████ (████) - ███ ████!");
  });
  it('Blacking protects markdown special characters', function () {
    Blacking("Hello [+group =*]{World, things (many) - and more!}", { groups: []})
      .should.equal("Hello \\*\\*\\*\\*\\*, \\*\\*\\*\\*\\*\\* (\\*\\*\\*\\*) - \\*\\*\\* \\*\\*\\*\\*!");
  });
});

describe('Rule Parser', function () {
  it('Positive group (single)', function () {
    let rules = Blacking.ruleParser("+group");
    rules.should.have.property('allowed');
    rules.allowed.should.have.property('length', 1);
    rules.allowed.should.containEql('group');
  });
  it('Positive groups (multiple)', function () {
    let rules = Blacking.ruleParser("+group +group2");
    rules.should.have.property('allowed');
    rules.allowed.should.have.property('length', 2);
    rules.allowed.should.containEql('group');
    rules.allowed.should.containEql('group2');
  });
  it('Denied group (single)', function () {
    let rules = Blacking.ruleParser("-group");
    rules.should.have.property('denied');
    rules.denied.should.have.property('length', 1);
    rules.denied.should.containEql('group');
  });
  it('Denied groups (multiple)', function () {
    let rules = Blacking.ruleParser("-group -group2");
    rules.should.have.property('denied');
    rules.denied.should.have.property('length', 2);
    rules.denied.should.containEql('group');
    rules.denied.should.containEql('group2');
  });
  it('Allowed and denied group (single)', function () {
    let rules = Blacking.ruleParser("+group -group2");
    rules.should.have.property('allowed');
    rules.should.have.property('denied');
    rules.allowed.should.have.property('length', 1);
    rules.denied.should.have.property('length', 1);
    rules.allowed.should.containEql('group');
    rules.denied.should.containEql('group2');
  });
  it('Blacking Character', function () {
    let rules = Blacking.ruleParser("=█");
    rules.should.have.property('blackingCharacter');
    rules.blackingCharacter.should.equal('█');
  })
});
