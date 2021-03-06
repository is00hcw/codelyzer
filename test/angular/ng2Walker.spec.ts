import * as ts from 'typescript';
import * as tslint from 'tslint/lib/lint';

import {Ng2Walker} from '../../src/angular/ng2Walker';
import {RecursiveAngularExpressionVisitor} from '../../src/angular/recursiveAngularExpressionVisitor';
import chai = require('chai');
import * as spies from 'chai-spies';

chai.use(spies);

const chaiSpy = (<any>chai).spy;
describe('ng2Walker', () => {
  it('should visit components and directives', () => {
    let source = `
      @Component({
        selector: 'foo',
        template: 'bar'
      })
      class Baz {}
      @Directive({
        selector: '[baz]'
      })
      class Foobar {}
    `;
    let ruleArgs: tslint.IOptions = {
      ruleName: 'foo',
      ruleArguments: ['foo'],
      disabledIntervals: null
    };
    let sf = ts.createSourceFile('foo', source, null);
    let walker = new Ng2Walker(sf, ruleArgs);
    let cmpSpy = chaiSpy.on(walker, 'visitNg2Component');
    let dirSpy = chaiSpy.on(walker, 'visitNg2Directive');
    walker.walk(sf);
    (<any>chai.expect(cmpSpy).to.have.been).called();
    (<any>chai.expect(dirSpy).to.have.been).called();
  });

  it('should visit inputs and outputs with args', () => {
    let source = `
      @Component({
        selector: 'foo',
      })
      class Baz {
        @Input('bar')
        foo;
        @Output('baz')
        foobar;
      }
    `;
    let ruleArgs: tslint.IOptions = {
      ruleName: 'foo',
      ruleArguments: ['foo'],
      disabledIntervals: null
    };
    let sf = ts.createSourceFile('foo', source, null);
    let walker = new Ng2Walker(sf, ruleArgs);
    let outputsSpy = chaiSpy.on(walker, 'visitNg2Output');
    let inputsSpy = chaiSpy.on(walker, 'visitNg2Input');
    walker.walk(sf);
    (<any>chai.expect(outputsSpy).to.have.been).called();
    (<any>chai.expect(inputsSpy).to.have.been).called();
  });

  it('should visit component templates', () => {
    let source = `
      @Component({
        selector: 'foo',
        template: '<div></div>'
      })
      class Baz {}
    `;
    let ruleArgs: tslint.IOptions = {
      ruleName: 'foo',
      ruleArguments: ['foo'],
      disabledIntervals: null
    };
    let sf = ts.createSourceFile('foo', source, null);
    let walker = new Ng2Walker(sf, ruleArgs);
    let templateSpy = chaiSpy.on(walker, 'visitNg2Template');
    walker.walk(sf);
    (<any>chai.expect(templateSpy).to.have.been).called();
  });

  it('should visit component template expressions', () => {
    let source = `
      @Component({
        selector: 'foo',
        template: '{{foo}}'
      })
      class Baz {}
    `;
    let ruleArgs: tslint.IOptions = {
      ruleName: 'foo',
      ruleArguments: ['foo'],
      disabledIntervals: null
    };
    let sf = ts.createSourceFile('foo', source, null);
    let walker = new Ng2Walker(sf, ruleArgs);
    let templateSpy = chaiSpy.on(RecursiveAngularExpressionVisitor.prototype, 'visitPropertyRead');
    walker.walk(sf);
    (<any>chai.expect(templateSpy).to.have.been).called();
  });

  it('should not thow when a template is not literal', () => {
    let source = `
      const template = '{{foo}}';
      @Component({
        selector: 'foo',
        template: template
      })
      class Baz {}
    `;
    let ruleArgs: tslint.IOptions = {
      ruleName: 'foo',
      ruleArguments: ['foo'],
      disabledIntervals: null
    };
    let sf = ts.createSourceFile('foo', source, null);
    let walker = new Ng2Walker(sf, ruleArgs);
    (<any>chai).expect(() => {
      let templateSpy = chaiSpy.on(RecursiveAngularExpressionVisitor.prototype, 'visitPropertyRead');
      walker.walk(sf);
      (<any>chai.expect(templateSpy).to.not.have.been).called();
    }).not.to.throw();
  });

  it('should ignore templateUrl', () => {
    let source = `
      @Component({
        selector: 'foo',
        templateUrl: 'test.html'
      })
      class Baz {}
    `;
    let ruleArgs: tslint.IOptions = {
      ruleName: 'foo',
      ruleArguments: ['foo'],
      disabledIntervals: null
    };
    let sf = ts.createSourceFile('foo', source, null);
    let walker = new Ng2Walker(sf, ruleArgs);
    (<any>chai).expect(() => {
      let templateSpy = chaiSpy.on(RecursiveAngularExpressionVisitor.prototype, 'visitPropertyRead');
      walker.walk(sf);
      (<any>chai.expect(templateSpy).to.not.have.been).called();
    }).not.to.throw();
  });

  it('should ignore empty @Component decorator', () => {
    let source = `
      @Component()
      class Baz {}
    `;
    let ruleArgs: tslint.IOptions = {
      ruleName: 'foo',
      ruleArguments: ['foo'],
      disabledIntervals: null
    };
    let sf = ts.createSourceFile('foo', source, null);
    let walker = new Ng2Walker(sf, ruleArgs);
    (<any>chai).expect(() => {
      let templateSpy = chaiSpy.on(RecursiveAngularExpressionVisitor.prototype, 'visitPropertyRead');
      walker.walk(sf);
      (<any>chai.expect(templateSpy).to.not.have.been).called();
    }).not.to.throw();
  });

  it('should ignore non-invoked @Component decorator', () => {
    let source = `
      @Component
      class Baz {}
    `;
    let ruleArgs: tslint.IOptions = {
      ruleName: 'foo',
      ruleArguments: ['foo'],
      disabledIntervals: null
    };
    let sf = ts.createSourceFile('foo', source, null);
    let walker = new Ng2Walker(sf, ruleArgs);
    (<any>chai).expect(() => {
      let templateSpy = chaiSpy.on(RecursiveAngularExpressionVisitor.prototype, 'visitPropertyRead');
      walker.walk(sf);
      (<any>chai.expect(templateSpy).to.not.have.been).called();
    }).not.to.throw();
  });

});

